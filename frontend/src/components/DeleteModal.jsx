import { AlertTriangle } from 'lucide-react';

export default function DeleteModal({ isOpen, friend, onConfirm, onCancel, isDeleting }) {
  if (!isOpen || !friend) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-warning">
          <AlertTriangle size={28} />
        </div>
        <h3 className="modal-title">Delete Friend</h3>
        <p className="modal-body">
          Are you sure you want to remove <strong>{friend.name}</strong> from your friends list? This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(friend.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner" />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Friend'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
