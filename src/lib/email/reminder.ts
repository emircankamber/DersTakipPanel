import { KIND_LABEL, formatDue } from "@/lib/assignments";
import { COURSE_COLORS, isCourseColor } from "@/lib/colors";
import type { AssignmentKind } from "@/lib/types";

export type ReminderItem = {
  assignment_id: string;
  title: string;
  kind: AssignmentKind;
  due_at: string;
  course_name: string;
  course_color: string;
  days_left: number;
  offset_days: number;
};

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function leftText(days: number) {
  return days === 1 ? "Yarın" : `${days} gün kaldı`;
}

export function reminderSubject(items: ReminderItem[]): string {
  const first = items[0];
  if (items.length === 1) {
    return first.days_left === 1
      ? `Yarın teslim: ${first.title}`
      : `${first.days_left} gün kaldı: ${first.title}`;
  }
  const lead = first.days_left === 1 ? "en yakını yarın" : `en yakını ${first.days_left} gün sonra`;
  return `${items.length} teslim yaklaşıyor — ${lead}`;
}

export function reminderText(items: ReminderItem[], siteUrl: string): string {
  const lines = items.map(
    (i) => `• ${i.title} (${KIND_LABEL[i.kind]}, ${i.course_name}) — ${formatDue(i.due_at)} · ${leftText(i.days_left)}`,
  );
  return [
    "Yaklaşan teslimlerin:",
    "",
    ...lines,
    "",
    `Ödevlerini gör: ${siteUrl}/odevler`,
    "",
    "Bu hatırlatmaları Ödevler sayfasındaki 'E-posta hatırlatma' anahtarından kapatabilirsin.",
  ].join("\n");
}

export function reminderHtml(items: ReminderItem[], siteUrl: string): string {
  const rows = items
    .map((i) => {
      const hex = isCourseColor(i.course_color) ? COURSE_COLORS[i.course_color].light : "#64748b";
      const urgent = i.days_left === 1;
      return `
      <tr>
        <td style="padding:14px 0;border-top:1px solid #ececef;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
            <td valign="top" width="14" style="padding-top:6px;"><div style="width:8px;height:8px;border-radius:4px;background:${hex};"></div></td>
            <td valign="top">
              <div style="font-size:15px;font-weight:600;color:#18181b;">${esc(i.title)}</div>
              <div style="font-size:13px;color:#71717a;margin-top:3px;">${KIND_LABEL[i.kind]} · ${esc(i.course_name)} · ${esc(formatDue(i.due_at))}</div>
            </td>
            <td valign="top" align="right" style="white-space:nowrap;font-size:13px;font-weight:600;color:${urgent ? "#b45309" : "#3f3f46"};">${leftText(i.days_left)}</td>
          </tr></table>
        </td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(reminderSubject(items))}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">
        <tr><td style="padding:28px 28px 8px;">
          <div style="font-size:13px;font-weight:600;color:#059669;letter-spacing:.02em;">Dönem</div>
          <h1 style="margin:10px 0 4px;font-size:20px;line-height:1.3;color:#18181b;">Yaklaşan teslimlerin</h1>
          <p style="margin:0;font-size:14px;color:#71717a;">Son teslim tarihi yaklaşan ödev ve projelerin:</p>
        </td></tr>
        <tr><td style="padding:12px 28px 4px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
        </td></tr>
        <tr><td style="padding:12px 28px 28px;">
          <a href="${siteUrl}/odevler" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 16px;border-radius:8px;">Ödevlerimi aç</a>
        </td></tr>
      </table>
      <p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#a1a1aa;text-align:center;">
        Teslimden 7, 3 ve 1 gün önce hatırlatılırsın. Kapatmak için Ödevler sayfasındaki “E-posta hatırlatma” anahtarını kullan.
      </p>
    </td></tr>
  </table>
</body></html>`;
}
