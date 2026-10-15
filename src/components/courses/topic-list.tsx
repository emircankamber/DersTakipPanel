"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeftIcon, ListChecksIcon, PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { addTopic, deleteTopic, renameTopic, toggleTopic } from "@/app/(app)/dersler/actions";
import type { Topic } from "@/lib/types";
import { cn } from "@/lib/utils";

type SetTopics = React.Dispatch<React.SetStateAction<Topic[]>>;

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
        checked ? "border-brand bg-brand" : "border-foreground/25 hover:border-foreground/50",
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3" fill="none" aria-hidden>
        <motion.path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-foreground"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </svg>
    </button>
  );
}

function TopicRow({ topic, setTopics }: { topic: Topic; setTopics: SetTopics }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(topic.title);
  const pending = topic.id.startsWith("tmp-");

  const patch = (p: Partial<Topic>) =>
    setTopics((list) => list.map((t) => (t.id === topic.id ? { ...t, ...p } : t)));

  async function toggle() {
    if (pending) return;
    const next = !topic.done;
    patch({ done: next });
    const res = await toggleTopic(topic.id, next);
    if (!res.ok) {
      patch({ done: !next });
      toast.error(res.error);
    }
  }

  async function remove() {
    if (pending) return;
    const snapshot = topic;
    setTopics((list) => list.filter((t) => t.id !== topic.id));
    const res = await deleteTopic(topic.id);
    if (!res.ok) {
      setTopics((list) => [...list, snapshot].sort((a, b) => a.position - b.position));
      toast.error(res.error);
    }
  }

  async function saveTitle() {
    setEditing(false);
    const clean = draft.trim();
    if (!clean || clean === topic.title) {
      setDraft(topic.title);
      return;
    }
    const previous = topic.title;
    patch({ title: clean });
    const res = await renameTopic(topic.id, clean);
    if (!res.ok) {
      patch({ title: previous });
      setDraft(previous);
      toast.error(res.error);
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden"
    >
      <div className="flex min-h-11 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-accent/50">
        <Checkbox checked={topic.done} onChange={toggle} label={topic.title} />
        {editing ? (
          <input
            autoFocus
            value={draft}
            maxLength={200}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setDraft(topic.title);
                setEditing(false);
              }
            }}
            className="h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-ring"
          />
        ) : (
          <button
            type="button"
            onClick={() => !pending && setEditing(true)}
            title="Düzenlemek için tıkla"
            className={cn(
              "min-w-0 flex-1 cursor-text py-2 text-left text-sm break-words transition-colors",
              topic.done && "text-muted-foreground line-through decoration-foreground/30",
              pending && "opacity-60",
            )}
          >
            {topic.title}
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          aria-label={`${topic.title} konusunu sil`}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-100 transition-[opacity,color,background-color] outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>
    </motion.li>
  );
}

export function TopicList({
  weekId,
  topics,
  stats,
  setTopics,
}: {
  weekId: string;
  topics: Topic[];
  stats?: { total: number; done: number };
  setTopics: SetTopics;
}) {
  const [title, setTitle] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const total = stats?.total ?? 0;
  const done = stats?.done ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    const position = topics.reduce((m, t) => Math.max(m, t.position), -1) + 1;
    const tmp: Topic = {
      id: `tmp-${crypto.randomUUID()}`,
      week_id: weekId,
      title: clean,
      done: false,
      position,
      created_at: new Date().toISOString(),
    };
    setTopics((list) => [...list, tmp]);
    setTitle("");
    inputRef.current?.focus();

    const res = await addTopic(weekId, clean, position);
    if (!res.ok) {
      setTopics((list) => list.filter((t) => t.id !== tmp.id));
      toast.error(res.error);
      return;
    }
    setTopics((list) => list.map((t) => (t.id === tmp.id ? { ...res.topic, _key: tmp.id } : t)));
  }

  return (
    <section className="surface" aria-labelledby="topics-title">
      <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
        <div>
          <h3 id="topics-title" className="font-display text-[22px] leading-tight">
            Konular
          </h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground tabular">
            {total === 0 ? "Bu hafta için konu yok" : `${done}/${total} tamamlandı`}
          </p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:w-28">
              <motion.div
                className="h-full rounded-full bg-brand"
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
              />
            </div>
            <span className="tabular w-9 text-right text-[13px] font-medium">%{pct}</span>
          </div>
        )}
      </div>

      <div className="px-4">
        {topics.length === 0 ? (
          <div className="mx-2 mb-1 flex flex-col items-center rounded-lg border border-dashed px-4 py-10 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-background">
              <ListChecksIcon className="size-[18px] text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium">Konu listesi boş</p>
            <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
              Bu hafta işlenen konuları aşağıya ekle, çalıştıkça işaretle.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            <AnimatePresence initial={false}>
              {topics.map((t) => (
                <TopicRow key={t._key ?? t.id} topic={t} setTopics={setTopics} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="p-4 pt-2">
        <label className="group flex h-11 items-center gap-3 rounded-lg border border-transparent px-2 transition-colors focus-within:border-input focus-within:bg-background hover:bg-accent/40 focus-within:hover:bg-background">
          <PlusIcon className="size-[18px] shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Konu ekle…"
            aria-label="Yeni konu"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70 sm:text-sm"
          />
          <AnimatePresence>
            {title.trim() && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex h-7 items-center gap-1 rounded-md border bg-card px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <CornerDownLeftIcon className="size-3" />
                Ekle
              </motion.button>
            )}
          </AnimatePresence>
        </label>
      </form>
    </section>
  );
}
