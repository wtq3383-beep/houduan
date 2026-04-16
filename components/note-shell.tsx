"use client";

import { type ChangeEvent, useEffect, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./note-shell.module.css";

type Note = {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
};

type SavePayload = {
  title: string;
  content: string;
  imageUrls: string[];
};

type EditorMode = "edit" | "preview";

export function NoteShell({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null>(initialNotes[0]?.id ?? null);
  const [title, setTitle] = useState(initialNotes[0]?.title ?? "");
  const [content, setContent] = useState(initialNotes[0]?.content ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(initialNotes[0]?.imageUrls ?? []);
  const [status, setStatus] = useState(initialNotes[0] ? "已打开首篇笔记" : "准备新建笔记");
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [isSaving, startSaving] = useTransition();
  const [isUploading, startUploading] = useTransition();

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    const selected = notes.find((note) => note.id === selectedId);

    if (!selected) {
      if (notes[0]) {
        setSelectedId(notes[0].id);
      } else {
        setTitle("");
        setContent("");
        setImageUrls([]);
      }
      return;
    }

    setTitle(selected.title);
    setContent(selected.content);
    setImageUrls(selected.imageUrls);
  }, [notes, selectedId]);

  async function saveNote() {
    const payload: SavePayload = { title, content, imageUrls };
    const method = selectedId ? "PATCH" : "POST";
    const url = selectedId ? `/api/notes/${selectedId}` : "/api/notes";

    startSaving(async () => {
      setStatus("正在保存...");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setStatus("保存失败");
        return;
      }

      const data = await response.json();
      const saved: Note = data.note;

      setNotes((current) => {
        const rest = current.filter((note) => note.id !== saved.id);
        return [saved, ...rest];
      });
      setSelectedId(saved.id);
      setStatus("已保存");
    });
  }

  async function removeNote() {
    if (!selectedId) {
      return;
    }

    const deletingId = selectedId;
    setStatus("正在删除...");

    const response = await fetch(`/api/notes/${deletingId}`, { method: "DELETE" });

    if (!response.ok) {
      setStatus("删除失败");
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== deletingId));
    setSelectedId(null);
    setTitle("");
    setContent("");
    setImageUrls([]);
    setStatus("已删除");
  }

  function createDraft() {
    setSelectedId(null);
    setTitle("");
    setContent("");
    setImageUrls([]);
    setEditorMode("edit");
    setStatus("正在编辑新笔记");
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    startUploading(async () => {
      setStatus("正在上传图片...");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        setStatus("上传失败");
        return;
      }

      const data = await response.json();
      setImageUrls((current) => [...current, data.url]);
      setStatus("图片已添加");
      event.target.value = "";
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const selectedNote = notes.find((note) => note.id === selectedId) ?? null;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Vercel Notes</p>
          <h1>个人笔记</h1>
          <p className={styles.subtitle}>支持 Markdown 编辑、图片上传和云端保存。</p>
        </div>
        <div className={styles.topbarActions}>
          <button type="button" className={styles.primaryButton} onClick={createDraft}>
            新建笔记
          </button>
          <button type="button" className={styles.ghostButton} onClick={logout}>
            退出登录
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div>
              <p className={styles.sectionLabel}>笔记列表</p>
              <strong>{notes.length} 篇</strong>
            </div>
            <span className={styles.statusPill}>{status}</span>
          </div>

          <div className={styles.noteList}>
            {notes.map((note) => {
              const isActive = note.id === selectedId;
              return (
                <button
                  key={note.id}
                  type="button"
                  className={isActive ? styles.noteCardActive : styles.noteCard}
                  onClick={() => {
                    setSelectedId(note.id);
                    setEditorMode("edit");
                  }}
                >
                  <div className={styles.noteCardTop}>
                    <strong>{note.title || "未命名笔记"}</strong>
                    <time>{new Date(note.updatedAt).toLocaleString("zh-CN")}</time>
                  </div>
                  <p>{note.content.slice(0, 80) || "暂无正文，点击进入编辑。"}</p>
                  <span>{note.imageUrls.length ? `${note.imageUrls.length} 张图片` : "无图片"}</span>
                </button>
              );
            })}
            {notes.length === 0 ? <p className={styles.empty}>还没有笔记，先创建第一篇吧。</p> : null}
          </div>
        </aside>

        <section className={styles.editor}>
          <div className={styles.editorHeader}>
            <div>
              <p className={styles.sectionLabel}>{selectedNote ? "当前笔记" : "新建草稿"}</p>
              <h2>{selectedNote?.title || "未命名笔记"}</h2>
            </div>
            <div className={styles.toolbarActions}>
              <label className={styles.uploadButton}>
                {isUploading ? "上传中..." : "添加图片"}
                <input type="file" accept="image/*" onChange={onFileChange} hidden />
              </label>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={saveNote}
                disabled={isSaving || isUploading}
              >
                {isSaving ? "保存中..." : "保存"}
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={removeNote}
                disabled={!selectedId}
              >
                删除
              </button>
            </div>
          </div>

          <div className={styles.metaRow}>
            <span>{wordCount} 词</span>
            <span>{imageUrls.length} 张图片</span>
            <span>{selectedId ? `ID ${selectedId.slice(0, 8)}` : "未保存草稿"}</span>
          </div>

          <input
            className={styles.titleInput}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="输入标题"
          />

          <div className={styles.modeTabs}>
            <button
              type="button"
              className={editorMode === "edit" ? styles.tabActive : styles.tab}
              onClick={() => setEditorMode("edit")}
            >
              编辑
            </button>
            <button
              type="button"
              className={editorMode === "preview" ? styles.tabActive : styles.tab}
              onClick={() => setEditorMode("preview")}
            >
              预览
            </button>
          </div>

          {editorMode === "edit" ? (
            <textarea
              className={styles.editorArea}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={"用 Markdown 记录内容，例如：\n# 标题\n- 列表\n**重点**\n> 引用"}
            />
          ) : (
            <div className={styles.previewArea}>
              {content.trim() ? (
                <article className={styles.markdown}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </article>
              ) : (
                <p className={styles.previewEmpty}>还没有内容，先切回编辑模式写点东西。</p>
              )}
            </div>
          )}

          <div className={styles.footerBar}>
            <span>{status}</span>
            <span>{editorMode === "edit" ? "当前为 Markdown 编辑模式" : "当前为 Markdown 预览模式"}</span>
          </div>
        </section>

        <aside className={styles.galleryPanel}>
          <div className={styles.sidebarHeader}>
            <div>
              <p className={styles.sectionLabel}>图片库</p>
              <strong>{imageUrls.length} 张</strong>
            </div>
            <span className={styles.helperText}>最近添加</span>
          </div>

          <div className={styles.gallery}>
            {imageUrls.length ? (
              imageUrls.map((url, index) => (
                <figure key={url} className={styles.figure}>
                  <img src={url} alt={`笔记图片 ${index + 1}`} className={styles.image} loading="lazy" />
                  <figcaption>{url}</figcaption>
                </figure>
              ))
            ) : (
              <div className={styles.galleryEmpty}>
                <strong>还没有图片</strong>
                <p>上传的图片会保存在 Vercel Blob，并显示在这里方便回看。</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
