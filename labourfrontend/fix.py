import os

filepath = 'src/components/LanguageSelector.tsx'
if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('Colors.textPrimaryMuted', 'Colors.textMuted')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
