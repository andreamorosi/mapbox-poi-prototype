let overlay;
let pendingResolve = null;

export function initModal() {
  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <h2 id="modal-heading">Add Point of Interest</h2>

      <div class="form-group">
        <label for="poi-title">Title <span class="required">*</span></label>
        <input type="text" id="poi-title" placeholder="e.g. Duomo di Milano" maxlength="80" autocomplete="off" />
        <span class="field-error" id="poi-title-error">Title is required</span>
      </div>

      <div class="form-group">
        <label for="poi-desc">Description</label>
        <textarea id="poi-desc" placeholder="A short description shown on hover…" maxlength="300"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="poi-icon">Icon</label>
          <input type="text" id="poi-icon" placeholder="📍" maxlength="4" autocomplete="off" />
        </div>
        <div class="form-group">
          <label for="poi-color">Color</label>
          <div class="color-row">
            <input type="color" id="poi-color" value="#e53e3e" />
            <span id="poi-color-value">#e53e3e</span>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <div class="modal-actions-left">
          <button class="btn btn-danger" id="btn-delete">Delete</button>
        </div>
        <button class="btn btn-secondary" id="btn-cancel">Cancel</button>
        <button class="btn btn-primary" id="btn-save">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const colorInput = overlay.querySelector('#poi-color');
  const colorValue = overlay.querySelector('#poi-color-value');
  colorInput.addEventListener('input', () => {
    colorValue.textContent = colorInput.value;
  });

  overlay.querySelector('#btn-save').addEventListener('click', handleSave);
  overlay.querySelector('#btn-cancel').addEventListener('click', handleCancel);
  overlay.querySelector('#btn-delete').addEventListener('click', handleDelete);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) handleCancel();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) handleCancel();
  });
}

function handleSave() {
  if (!pendingResolve) return;
  const titleInput = overlay.querySelector('#poi-title');
  const titleError = overlay.querySelector('#poi-title-error');

  if (!titleInput.value.trim()) {
    titleError.classList.add('visible');
    titleInput.focus();
    return;
  }
  titleError.classList.remove('visible');

  const resolve = pendingResolve;
  pendingResolve = null;
  closeModal();

  resolve({
    action: 'save',
    title: titleInput.value.trim(),
    description: overlay.querySelector('#poi-desc').value.trim(),
    icon: overlay.querySelector('#poi-icon').value.trim() || '📍',
    color: overlay.querySelector('#poi-color').value,
  });
}

function handleCancel() {
  if (!pendingResolve) return;
  const resolve = pendingResolve;
  pendingResolve = null;
  closeModal();
  resolve({ action: 'cancel' });
}

function handleDelete() {
  if (!pendingResolve) return;
  const resolve = pendingResolve;
  pendingResolve = null;
  closeModal();
  resolve({ action: 'delete' });
}

function closeModal() {
  overlay.classList.remove('open');
  overlay.querySelector('#poi-title-error').classList.remove('visible');
}

export function openModal({ title = '', description = '', icon = '📍', color = '#e53e3e', editMode = false } = {}) {
  return new Promise((resolve) => {
    pendingResolve = resolve;

    overlay.querySelector('#modal-heading').textContent = editMode
      ? 'Edit Point of Interest'
      : 'Add Point of Interest';
    overlay.querySelector('#poi-title').value = title;
    overlay.querySelector('#poi-desc').value = description;
    overlay.querySelector('#poi-icon').value = icon;
    overlay.querySelector('#poi-color').value = color;
    overlay.querySelector('#poi-color-value').textContent = color;
    overlay.querySelector('#btn-delete').style.display = editMode ? '' : 'none';

    overlay.classList.add('open');
    setTimeout(() => overlay.querySelector('#poi-title').focus(), 50);
  });
}
