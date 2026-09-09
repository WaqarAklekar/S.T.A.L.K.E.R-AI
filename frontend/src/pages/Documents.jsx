import React, {
  useEffect,
  useState,
} from "react";

import {
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

export default function Documents() {
  const [documents, setDocuments] =
    useState(
      () =>
        JSON.parse(
          localStorage.getItem(
            "stalker_documents"
          ) || "[]"
        )
    );

  const [title, setTitle] =
    useState("");

  function save() {
    if (!title.trim()) return;

    const next = [
      {
        id: Date.now(),
        title: title.trim(),
        createdAt:
          new Date().toISOString(),
      },
      ...documents,
    ];

    setDocuments(next);

    localStorage.setItem(
      "stalker_documents",
      JSON.stringify(next)
    );

    setTitle("");
  }

  function remove(id) {
    const next =
      documents.filter(
        (doc) => doc.id !== id
      );

    setDocuments(next);

    localStorage.setItem(
      "stalker_documents",
      JSON.stringify(next)
    );
  }

  return (
    <div className="content-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">
            CASE MATERIAL
          </div>

          <h2 className="page-title">
            Documents
          </h2>

          <p className="page-subtitle">
            Local prototype workspace for
            investigation documents.
          </p>
        </div>
      </div>

      <section className="intel-panel">
        <div className="document-create">
          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Document title..."
          />

          <button
            className="primary-button"
            onClick={save}
          >
            <Plus size={16} />
            ADD DOCUMENT
          </button>
        </div>
      </section>

      <div className="document-grid">
        {documents.map((doc) => (
          <div
            className="document-card"
            key={doc.id}
          >
            <FileText size={24} />

            <div>
              <strong>
                {doc.title}
              </strong>

              <span>
                {new Date(
                  doc.createdAt
                ).toLocaleString()}
              </span>
            </div>

            <button
              className="icon-button danger"
              onClick={() =>
                remove(doc.id)
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {!documents.length && (
          <div className="empty-state large">
            <FileText size={34} />

            <strong>
              No documents
            </strong>

            <span>
              Add case documents to this
              prototype workspace.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}