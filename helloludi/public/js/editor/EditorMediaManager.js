/**
 * EditorMediaManager.js
 * Gestion des médias (images, vidéos, tableaux)
 */
(function(window) {
    'use strict';

    class EditorMediaManager {
        constructor(editorCore) {
            this.editor = editorCore;
            this.uploadUrl = editorCore.options.uploadUrl;
            this.selectedMedia = null;
            this.tableColors = {
                'marron': '#8b785d',
                'beige': '#d4c4a8',
                'saumon': '#ff6b6b',
                'orange': '#ff8e53',
                'gris': '#e8e3d3'
            };
        }

        showLinkModal() {
            if (window.ModalManager) {
                this.editor.saveCurrentRange();
                window.ModalManager.show('linkModal');

                const selection = window.getSelection();
                const selectedText = selection.toString();

                const linkTextInput = document.getElementById('linkText');
                const linkUrlInput = document.getElementById('linkUrl');

                if (linkTextInput && selectedText) {
                    linkTextInput.value = selectedText;
                }

                if (linkUrlInput) {
                    linkUrlInput.value = 'https://';
                    linkUrlInput.focus();
                }
            }
        }

        insertLink() {
            const textInput = document.getElementById('linkText');
            const urlInput = document.getElementById('linkUrl');
            const newTabInput = document.getElementById('linkNewTab');

            if (!textInput || !urlInput || !newTabInput) {
                console.error('Link form elements not found');
                return;
            }

            const text = textInput.value;
            const url = urlInput.value;
            const newTab = newTabInput.checked;

            if (text && url) {
                const link = document.createElement('a');
                link.href = url;
                link.textContent = text;

                if (newTab) {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }

                this.editor.restoreRange();
                this.insertHTML(link.outerHTML);

                if (window.ModalManager) {
                    window.ModalManager.hide('linkModal');
                }

                textInput.value = '';
                urlInput.value = 'https://';
                newTabInput.checked = false;
            }
        }

        showImageModal() {
            if (window.ModalManager) {
                this.editor.saveCurrentRange();
                window.ModalManager.show('imageModal');
            }
        }

        async insertImage() {
            const fileInput = document.getElementById('imageFile');
            const urlInput = document.getElementById('imageUrl');
            const altInput = document.getElementById('imageAlt');

            if (!fileInput || !urlInput || !altInput) {
                console.error('Image form elements not found');
                return;
            }

            const imageFile = fileInput.files[0];
            const imageUrl = urlInput.value;
            const imageAlt = altInput.value || 'Image';

            try {
                let imgSrc = '';

                if (imageFile) {
                    const uploadedUrl = await this.uploadImage(imageFile);
                    imgSrc = uploadedUrl;
                } else if (imageUrl) {
                    imgSrc = imageUrl;
                }

                if (imgSrc) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'image-wrapper';
                    wrapper.style.textAlign = 'center';
                    wrapper.style.margin = '20px 0';

                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.alt = imageAlt;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';

                    wrapper.appendChild(img);

                    this.editor.restoreRange();
                    this.insertHTML(wrapper.outerHTML);

                    if (window.ModalManager) {
                        window.ModalManager.hide('imageModal');
                    }

                    fileInput.value = '';
                    urlInput.value = '';
                    altInput.value = '';
                }
            } catch (error) {
                console.error('Erreur lors de l\'insertion de l\'image:', error);
                alert('Erreur lors du téléchargement de l\'image: ' + error.message);
            }
        }

        async uploadImage(file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(this.uploadUrl, {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Erreur serveur: ${response.status}`);
                }

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.error);
                }

                if (!result.link) {
                    throw new Error('Aucun lien d\'image retourné');
                }

                return result.link;
            } catch (error) {
                console.error('Upload error:', error);
                throw error;
            }
        }

        showTableModal() {
            if (window.ModalManager) {
                this.editor.saveCurrentRange();
                window.ModalManager.show('tableModal');

                // Attendre que la modal soit visible
                setTimeout(() => {
                    this.updateTablePreview();
                }, 100);
            }
        }

        updateTablePreview() {
            const rowsInput = document.getElementById('tableRows');
            const colsInput = document.getElementById('tableCols');
            const colorInput = document.getElementById('tableColor');
            const sortableInput = document.getElementById('tableSortable');
            const preview = document.getElementById('tablePreview');

            if (!rowsInput || !colsInput || !colorInput || !sortableInput || !preview) {
                console.warn('Table modal elements not found');
                return;
            }

            const rows = parseInt(rowsInput.value) || 3;
            const cols = parseInt(colsInput.value) || 3;
            const color = colorInput.value;
            const sortable = sortableInput.checked;

            let tableHTML = '<table class="table table-bordered"';
            if (color && this.tableColors[color]) {
                tableHTML += ` style="background-color: ${this.tableColors[color]};"`;
            }
            tableHTML += '>';

            tableHTML += '<thead><tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += `<th${sortable ? ' style="cursor: pointer;"' : ''}>En-tête ${j + 1}</th>`;
            }
            tableHTML += '</tr></thead>';

            tableHTML += '<tbody>';
            for (let i = 0; i < rows - 1; i++) {
                tableHTML += '<tr>';
                for (let j = 0; j < cols; j++) {
                    tableHTML += `<td>Cellule ${i + 1}-${j + 1}</td>`;
                }
                tableHTML += '</tr>';
            }
            tableHTML += '</tbody></table>';

            preview.innerHTML = tableHTML;
        }

        insertTable() {
            const rowsInput = document.getElementById('tableRows');
            const colsInput = document.getElementById('tableCols');
            const colorInput = document.getElementById('tableColor');
            const sortableInput = document.getElementById('tableSortable');

            if (!rowsInput || !colsInput || !colorInput || !sortableInput) {
                console.error('Table form elements not found');
                return;
            }

            const rows = parseInt(rowsInput.value) || 3;
            const cols = parseInt(colsInput.value) || 3;
            const color = colorInput.value;
            const sortable = sortableInput.checked;

            const tableId = 'table_' + Date.now();

            let tableHTML = `<table id="${tableId}" class="editor-table table table-bordered"`;
            if (color && this.tableColors[color]) {
                tableHTML += ` style="background-color: ${this.tableColors[color]};"`;
            }
            tableHTML += '>';

            tableHTML += '<thead><tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += `<th${sortable ? ' style="cursor: pointer;"' : ''}>En-tête ${j + 1}</th>`;
            }
            tableHTML += '</tr></thead>';

            tableHTML += '<tbody>';
            for (let i = 0; i < rows - 1; i++) {
                tableHTML += '<tr>';
                for (let j = 0; j < cols; j++) {
                    tableHTML += '<td></td>';
                }
                tableHTML += '</tr>';
            }
            tableHTML += '</tbody></table><p><br></p>';

            this.editor.restoreRange();
            this.insertHTML(tableHTML);

            if (sortable) {
                setTimeout(() => this.makeTableSortable(tableId), 100);
            }

            if (window.ModalManager) {
                window.ModalManager.hide('tableModal');
            }

            rowsInput.value = '3';
            colsInput.value = '3';
            colorInput.value = '';
            sortableInput.checked = false;
        }

        makeTableSortable(tableId) {
            const table = this.editor.editor.querySelector(`#${tableId}`);
            if (!table) return;

            const headers = table.querySelectorAll('th');
            headers.forEach((header, index) => {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    this.sortTable(table, index);
                });
            });
        }

        sortTable(table, columnIndex) {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            const isNumeric = rows.every(row => {
                const cell = row.cells[columnIndex];
                return !isNaN(parseFloat(cell.textContent));
            });

            rows.sort((a, b) => {
                const aVal = a.cells[columnIndex].textContent;
                const bVal = b.cells[columnIndex].textContent;

                if (isNumeric) {
                    return parseFloat(aVal) - parseFloat(bVal);
                } else {
                    return aVal.localeCompare(bVal);
                }
            });

            rows.forEach(row => tbody.appendChild(row));
            this.editor.updateHiddenField();
        }

        showVideoModal() {
            if (window.ModalManager) {
                this.editor.saveCurrentRange();
                window.ModalManager.show('videoModal');

                const urlInput = document.getElementById('videoUrl');
                if (urlInput) {
                    urlInput.focus();
                }
            }
        }

        insertVideo() {
            const urlInput = document.getElementById('videoUrl');

            if (!urlInput) {
                console.error('Video URL input not found');
                return;
            }

            const videoUrl = urlInput.value;
            const videoId = this.extractVideoId(videoUrl);

            if (videoId) {
                const wrapper = document.createElement('div');
                wrapper.className = 'video-wrapper';
                wrapper.style.position = 'relative';
                wrapper.style.paddingBottom = '56.25%';
                wrapper.style.height = '0';
                wrapper.style.overflow = 'hidden';
                wrapper.style.maxWidth = '100%';
                wrapper.style.margin = '20px auto';

                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                iframe.frameBorder = '0';
                iframe.allowFullscreen = true;
                iframe.style.position = 'absolute';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';

                wrapper.appendChild(iframe);

                this.editor.restoreRange();
                this.insertHTML(wrapper.outerHTML + '<p><br></p>');

                if (window.ModalManager) {
                    window.ModalManager.hide('videoModal');
                }

                urlInput.value = '';
            } else {
                alert('URL YouTube invalide');
            }
        }

        extractVideoId(url) {
            if (!url) return null;

            if (url.match(/^[a-zA-Z0-9_-]{11}$/)) return url;

            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }

            return null;
        }

        insertHTML(html) {
            if (this.editor.commands) {
                this.editor.commands.insertHTML(html);
            } else {
                this.editor.focus();
                document.execCommand('insertHTML', false, html);
                this.editor.updateHiddenField();
            }
        }
    }

    // Exposer la classe globalement
    window.EditorMediaManager = EditorMediaManager;

})(window);