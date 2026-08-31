/* Markdown -> DOCX converter voor de Haarlemmermeer-rapporten. */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  TableOfContents, PageBreak, Footer, PageNumber, LevelFormat, convertInchesToTwip,
} = require("docx");

const ACCENT = "0E5A5E";
const INK = "141C22";
const SOFT = "46545C";
const RULE = "D3D9D5";
const CODEBG = "F1F3F1";

const CONTENT_W = 9026; // A4 (11906) minus 2x 1440 twip marges

// ---------- inline opmaak ----------
const INLINE_SRC = "(`[^`]+`)|(\\*\\*[^*]+?\\*\\*)|(\\[[^\\]]+\\]\\([^)]+\\))|(\\*[^*\\s][^*]*?\\*)";

function inlineRuns(text, base = {}) {
  const runs = [];
  let last = 0, m;
  const re = new RegExp(INLINE_SRC, "g"); // eigen regex per aanroep: recursie mag lastIndex niet delen
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push(new TextRun({ ...base, text: text.slice(last, m.index) }));
    const tok = m[0];
    if (tok.startsWith("`")) {
      runs.push(new TextRun({ ...base, text: tok.slice(1, -1), font: "Consolas", size: 19, color: ACCENT }));
    } else if (tok.startsWith("**")) {
      runs.push(...inlineRuns(tok.slice(2, -2), { ...base, bold: true }));
    } else if (tok.startsWith("[")) {
      const label = tok.slice(1, tok.indexOf("]("));
      runs.push(new TextRun({ ...base, text: label, color: ACCENT, underline: {} }));
    } else {
      runs.push(...inlineRuns(tok.slice(1, -1), { ...base, italics: true }));
    }
    last = m.index + tok.length;
  }
  if (last < text.length) runs.push(new TextRun({ ...base, text: text.slice(last) }));
  return runs.length ? runs : [new TextRun({ ...base, text: "" })];
}

// ---------- tabel ----------
function splitRow(line) {
  return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
}

function isDivider(line) {
  return /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes("-");
}

function columnWidths(n) {
  const weights = Array.from({ length: n }, (_, i) => (i === 0 ? 2.2 : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  const w = weights.map((x) => Math.floor((x / total) * CONTENT_W));
  w[n - 1] += CONTENT_W - w.reduce((a, b) => a + b, 0); // afrondingsrest
  return w;
}

function buildTable(rows) {
  const header = rows[0];
  const body = rows.slice(1);
  const n = header.length;
  const widths = columnWidths(n);

  const cell = (text, opts) =>
    new TableCell({
      width: { size: widths[opts.i], type: WidthType.DXA },
      shading: opts.head
        ? { type: ShadingType.CLEAR, color: "auto", fill: "E8EBE8" }
        : undefined,
      margins: { top: 90, bottom: 90, left: 120, right: 120 },
      children: [
        new Paragraph({
          spacing: { before: 0, after: 0 },
          alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: inlineRuns(text, {
            size: 19,
            bold: opts.head || undefined,
            color: opts.head ? SOFT : opts.i === 0 ? INK : SOFT,
          }),
        }),
      ],
    });

  const narrow = n >= 5;
  return new Table({
    columnWidths: widths,
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: RULE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E2E7E3" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: header.map((t, i) => cell(t, { i, head: true, center: narrow && i > 0 })),
      }),
      ...body.map(
        (r) =>
          new TableRow({
            children: Array.from({ length: n }, (_, i) =>
              cell(r[i] ?? "", { i, center: narrow && i > 0 })
            ),
          })
      ),
    ],
  });
}

// ---------- hoofdparser ----------
function convert(md, opts) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  let orderedInstance = 0;
  let seenH2 = false;
  let sawTitle = false;

  const push = (p) => out.push(p);

  while (i < lines.length) {
    const line = lines[i];

    // codeblok
    if (/^\s*```/.test(line)) {
      i++;
      const code = [];
      while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
      i++; // sluitende fence
      code.forEach((c, idx) =>
        push(
          new Paragraph({
            spacing: { before: idx === 0 ? 120 : 0, after: idx === code.length - 1 ? 160 : 0 },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: CODEBG },
            indent: { left: 170, right: 170 },
            children: [new TextRun({ text: c || " ", font: "Consolas", size: 16, color: INK })],
          })
        )
      );
      continue;
    }

    // tabel
    if (/^\s*\|/.test(line) && i + 1 < lines.length && isDivider(lines[i + 1])) {
      const rows = [splitRow(line)];
      i += 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
      push(buildTable(rows));
      push(new Paragraph({ spacing: { after: 200 }, children: [] }));
      continue;
    }

    // koppen
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      const level = m[1].length;
      const text = m[2].trim();
      if (level === 1) {
        // H1 hoort bij de titelpagina; overslaan in de body
        sawTitle = true;
        i++;
        continue;
      }
      if (level === 2 && sawTitle && !seenH2 && out.length === 0) {
        // ondertitelregel direct onder de H1 — staat al op de titelpagina
        i++;
        continue;
      }
      const heading =
        level === 2 ? HeadingLevel.HEADING_1 : level === 3 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
      if (level === 2) {
        push(
          new Paragraph({
            heading,
            pageBreakBefore: seenH2,
            spacing: { before: seenH2 ? 0 : 240, after: 180 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 6 } },
            children: inlineRuns(text),
          })
        );
        seenH2 = true;
      } else {
        push(new Paragraph({ heading, spacing: { before: 300, after: 120 }, children: inlineRuns(text) }));
      }
      i++;
      continue;
    }

    // horizontale lijn -> overslaan (koppen scheiden al)
    if (/^\s*---+\s*$/.test(line)) { i++; continue; }

    // blockquote
    if ((m = line.match(/^\s*>\s?(.*)$/))) {
      push(
        new Paragraph({
          spacing: { before: 120, after: 160 },
          indent: { left: 340 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 12 } },
          children: inlineRuns(m[1], { italics: true, color: SOFT }),
        })
      );
      i++;
      continue;
    }

    // opsomming
    if ((m = line.match(/^(\s*)[-*]\s+(.*)$/))) {
      const level = Math.min(Math.floor(m[1].length / 2), 2);
      push(
        new Paragraph({
          numbering: { reference: "bullets", level, instance: 0 },
          spacing: { before: 0, after: 80 },
          children: inlineRuns(m[2]),
        })
      );
      i++;
      continue;
    }

    // genummerde lijst
    if ((m = line.match(/^(\s*)(\d+)\.\s+(.*)$/))) {
      const prev = lines[i - 1] || "";
      if (!/^(\s*)\d+\.\s+/.test(prev)) orderedInstance++;
      const level = Math.min(Math.floor(m[1].length / 2), 2);
      push(
        new Paragraph({
          numbering: { reference: "numbers", level, instance: orderedInstance },
          spacing: { before: 0, after: 80 },
          children: inlineRuns(m[3]),
        })
      );
      i++;
      continue;
    }

    // lege regel
    if (!line.trim()) { i++; continue; }

    // gewone alinea
    push(new Paragraph({ spacing: { before: 0, after: 160 }, children: inlineRuns(line.trim()) }));
    i++;
  }

  // ---------- document ----------
  const titleBlock = [
    new Paragraph({
      spacing: { before: 2600, after: 160 },
      children: [
        new TextRun({ text: opts.eyebrow.toUpperCase(), font: "Consolas", size: 18, color: ACCENT, characterSpacing: 30 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: opts.title, bold: true, size: 56, color: INK })],
    }),
    new Paragraph({
      spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE, space: 12 } },
      children: [new TextRun({ text: opts.subtitle, size: 26, color: SOFT })],
    }),
    ...opts.meta.map(
      (line) =>
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: line.label + "  ", font: "Consolas", size: 17, color: SOFT }),
            new TextRun({ text: line.value, size: 20, color: INK }),
          ],
        })
    ),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: "Inhoudsopgave", bold: true, size: 32, color: INK })],
    }),
    new TableOfContents("Inhoud", { hyperlinks: true, headingStyleRange: "1-2" }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  return new Document({
    creator: "Mustapha El Moumene",
    title: opts.title,
    description: opts.subtitle,
    features: { updateFields: true },
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 21, color: INK }, paragraph: { spacing: { line: 276 } } },
        heading1: {
          run: { font: "Calibri", size: 32, bold: true, color: INK },
          paragraph: { spacing: { before: 320, after: 180 } },
        },
        heading2: {
          run: { font: "Calibri", size: 25, bold: true, color: ACCENT },
          paragraph: { spacing: { before: 280, after: 120 } },
        },
        heading3: {
          run: { font: "Calibri", size: 22, bold: true, color: INK },
          paragraph: { spacing: { before: 240, after: 100 } },
        },
      },
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          quickFormat: true,
          run: { font: "Calibri", size: 21, color: INK },
          paragraph: { spacing: { line: 276, after: 0 } },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [0, 1, 2].map((l) => ({
            level: l,
            format: LevelFormat.BULLET,
            text: ["•", "–", "•"][l],
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 360 + l * 360, hanging: 260 } } },
          })),
        },
        {
          reference: "numbers",
          levels: [0, 1, 2].map((l) => ({
            level: l,
            format: LevelFormat.DECIMAL,
            text: `%${l + 1}.`,
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 360 + l * 360, hanging: 300 } } },
          })),
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 8 } },
                children: [
                  new TextRun({ text: opts.footer + "   ·   ", size: 16, color: SOFT }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: SOFT }),
                ],
              }),
            ],
          }),
        },
        children: [...titleBlock, ...out],
      },
    ],
  });
}

// ---------- uitvoeren ----------
const [, , mdPath, outPath, cfgPath] = process.argv;
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");
Packer.toBuffer(convert(md, cfg)).then((buf) => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log("geschreven:", outPath, (buf.length / 1024).toFixed(0) + " kB");
});
