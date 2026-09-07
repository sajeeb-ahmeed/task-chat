/** Adapt the deployed portfolio agent's text protocol without rewriting code or prose. */
export function formatAIResponse(raw: string): string {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const output: string[] = [];
  let fence: { character: string; length: number } | undefined;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const markdownFence = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      output.push(line);
      if (
        markdownFence &&
        markdownFence[1][0] === fence.character &&
        markdownFence[1].length >= fence.length &&
        !markdownFence[2].trim()
      )
        fence = undefined;
      continue;
    }
    if (markdownFence) {
      fence = { character: markdownFence[1][0], length: markdownFence[1].length };
      output.push(line);
      continue;
    }
    const code = line.match(/^\s*CODE_START\s*:\s*([\w.+#-]*)\s*$/i);
    if (code) {
      const body: string[] = [];
      while (++index < lines.length && !/^\s*CODE_END\s*$/i.test(lines[index]))
        body.push(lines[index]);
      const ticks = Math.max(
        3,
        ...Array.from(body.join('\n').matchAll(/`+/g), (match) => match[0].length + 1),
      );
      const delimiter = '`'.repeat(ticks);
      output.push('', delimiter + code[1], ...body, delimiter, '');
      continue;
    }
    const section = line.match(/^\s*SECTION\s*:\s*(.+)$/i);
    const paragraph = line.match(/^\s*PARA\s*:\s*(.+)$/i);
    const item = line.match(/^\s*ITEM\s*:\s*(.+)$/i);
    if (section) output.push('', `## ${section[1]}`, '');
    else if (paragraph) output.push('', paragraph[1], '');
    else if (item) {
      if (output.length && !/^\s*- /.test(output[output.length - 1])) output.push('');
      output.push(`- ${item[1]}`);
    } else output.push(line);
  }
  return output.join('\n').trim();
}
