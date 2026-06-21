import re

with open('README.md', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
result = []
in_fence = False

for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == '```' and not in_fence:
        result.append('```text')
        in_fence = True
    elif stripped == '```' and in_fence:
        result.append('```')
        in_fence = False
    elif stripped.startswith('```js') or stripped.startswith('```text'):
        result.append(line)
        in_fence = not in_fence
    else:
        result.append(line)

with open('README.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(result))
print('Done')
