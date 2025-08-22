// src/components/PostMenuActions.jsx
import { useState } from "react";
import { SignedIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";

export default function PostMenuActions({
  onSave,
  onEdit, // optional if you don't use editTo
  onDelete, // async () => {...}
  editTo, // optional string route for <Link>
  disabled = false,
  resourceName = "this post", // used in the modal copy
}) {
  const icon = "w-5 h-5 flex-shrink-0 text-gray-700 group-hover:text-blue-600 transition-colors";
  const rowBtn = "flex items-center gap-2 py-2 text-sm group select-none";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    if (!onDelete) return;
    setDeleting(true);
    setError("");
    try {
      await onDelete(); // parent-provided async delete (API, then navigate, etc.)
      setConfirmOpen(false); // close on success
    } catch (e) {
      setError(e?.message || "Failed to delete. Please try again.");
      // keep modal open; user can retry or cancel
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-1">
      <h1 className="text-lg font-semibold">Actions</h1>

      {/* Save — visible to everyone */}
      <button
        type="button"
        onClick={onSave}
        disabled={disabled || !onSave}
        className={`${rowBtn} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            d="M16 11V7a4 4 0 00-8 0v4m8 0a 4 4 0 01-8 0m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h2"
            strokeWidth="2"
          />
        </svg>
        <span>Save this Post</span>
      </button>

      <SignedIn>
        {/* Edit — directly under Save */}
        {editTo ? (
          <Link to={editTo} className={`${rowBtn} cursor-pointer`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={icon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.563 4.5 19.5l.937-3.75L16.862 3.487z"
              />
            </svg>
            <span>Edit this Post</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled || !onEdit}
            className={`${rowBtn} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={icon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.563 4.5 19.5l.937-3.75L16.862 3.487z"
              />
            </svg>
            <span>Edit this Post</span>
          </button>
        )}

        {/* Delete — opens modal */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={disabled || !onDelete}
          className={`${rowBtn} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={icon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-8 0h10l-1-3H8l-1 3z"
            />
          </svg>
          <span>Delete this Post</span>
        </button>
      </SignedIn>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete post?"
        message={
          error
            ? error
            : `Are you sure you want to delete ${resourceName}? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onClose={() => (deleting ? null : setConfirmOpen(false))}
        loading={deleting}
      />
    </div>
  );
}
