import os
import shutil
import re
import sys

filepath = r'g:\マイドライブ\【04_素材・ツールライブラリ】\OBS_タイトルセーブ\GIT\TwitchManager\TwitchManagerDock.html'
out_dir = r'g:\マイドライブ\【04_素材・ツールライブラリ】\OBS_タイトルセーブ\GIT\TwitchManager'
old_dir = os.path.join(out_dir, '_OLD')

os.makedirs(old_dir, exist_ok=True)

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Backup original
backup_path = os.path.join(old_dir, 'TwitchManagerDock_Full.html')
shutil.copy2(filepath, backup_path)

# 2. Extract CSS
# Find all style tags within head or body before scripts
style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL)
css_content = ""
for match in style_pattern.finditer(content):
    css_content += match.group(1).strip() + '\n\n'

# Replace style tags in content with nothing
content_no_styles = style_pattern.sub('', content)

# Insert link tag right before </head>
head_end_idx = content_no_styles.find('</head>')
if head_end_idx != -1:
    content_no_styles = content_no_styles[:head_end_idx] + '    <link rel="stylesheet" href="twitch_manager.css">\n' + content_no_styles[head_end_idx:]

# 3. Extract JS
# Find all script tags that don't have a 'src' attribute (inline scripts)
script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL)
all_inline_scripts = ""
for match in script_pattern.finditer(content_no_styles):
    all_inline_scripts += match.group(1) + '\n\n'

# Replace inline scripts in content_no_styles with a placeholder to insert our new script tags
# But we only want to insert the new script tags where the FIRST inline script was.
first_script_match = script_pattern.search(content_no_styles)
if first_script_match:
    first_script_start = first_script_match.start()
    
    # Remove all inline scripts
    content_clean = script_pattern.sub('', content_no_styles)
    
    # We need to find I18N_DATA in all_inline_scripts
    i18n_start_idx = all_inline_scripts.find('const I18N_DATA ={')
    if i18n_start_idx == -1:
        i18n_start_idx = all_inline_scripts.find('const I18N_DATA = {')
        
    if i18n_start_idx != -1:
        brace_count = 0
        in_i18n = False
        i18n_end_idx = -1
        for i in range(i18n_start_idx, len(all_inline_scripts)):
            if all_inline_scripts[i] == '{':
                if not in_i18n:
                    in_i18n = True
                brace_count += 1
            elif all_inline_scripts[i] == '}':
                brace_count -= 1
                if in_i18n and brace_count == 0:
                    i18n_end_idx = i + 1
                    if i18n_end_idx < len(all_inline_scripts) and all_inline_scripts[i18n_end_idx] == ';':
                        i18n_end_idx += 1
                    break
                    
        locales_js = all_inline_scripts[i18n_start_idx:i18n_end_idx].strip()
        main_js = all_inline_scripts[:i18n_start_idx] + all_inline_scripts[i18n_end_idx:]
        main_js = main_js.strip()
        
        # Write CSS
        with open(os.path.join(out_dir, 'twitch_manager.css'), 'w', encoding='utf-8') as f:
            f.write(css_content.strip())
            
        # Write Locales
        with open(os.path.join(out_dir, 'twitch_manager_locales.js'), 'w', encoding='utf-8') as f:
            f.write(locales_js)
            
        # Write Main JS
        with open(os.path.join(out_dir, 'twitch_manager_main.js'), 'w', encoding='utf-8') as f:
            f.write(main_js)
            
        # Insert script tags at the location of the original first script
        # Wait, removing all inline scripts changed the indices.
        # We can just append them right before </body>.
        body_end_idx = content_clean.find('</body>')
        if body_end_idx != -1:
            new_html = content_clean[:body_end_idx] + '    <script src="twitch_manager_locales.js"></script>\n    <script src="twitch_manager_main.js"></script>\n' + content_clean[body_end_idx:]
        else:
            new_html = content_clean + '\n<script src="twitch_manager_locales.js"></script>\n<script src="twitch_manager_main.js"></script>\n'
            
        # Clean up excessive newlines caused by removing tags
        new_html = re.sub(r'\n\s*\n\s*\n', '\n\n', new_html)

        with open(os.path.join(out_dir, 'TwitchManagerDock.html'), 'w', encoding='utf-8') as f:
            f.write(new_html)
            
        print("Files split successfully.")
    else:
        print("Could not find I18N_DATA.")
else:
    print("Could not find inline script tags.")
