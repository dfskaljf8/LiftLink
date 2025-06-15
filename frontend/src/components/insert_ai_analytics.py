import re

# Read the current file
with open('ComprehensiveAnalytics.js', 'r') as f:
    content = f.read()

# Replace the old ai-insights section with accountability-coach
# Find the start of the AI section
start_pattern = r'(\s*{/\* AI Insights Section \*/\}\s*{selectedMetric === \'ai-insights\' &&)'
end_pattern = r'(\s*}\s*}\s*</div>\s*\);\s*};\s*export default ComprehensiveAnalytics;)'

# Replace ai-insights with accountability-coach
content = re.sub(r'selectedMetric === \'ai-insights\'', 'selectedMetric === \'accountability-coach\'', content)
content = re.sub(r'{metric === \'ai-insights\' \? \'🤖 AI Insights\' : metric\.charAt\(0\)\.toUpperCase\(\) \+ metric\.slice\(1\)}', 
                 '{metric === \'accountability-coach\' ? \'🧠 AI Coach\' : metric.charAt(0).toUpperCase() + metric.slice(1)}', content)

# Replace the AI Insights Section comment
content = re.sub(r'{/\* AI Insights Section \*/}', '{/* AI Accountability Coach Section */}', content)

# Replace the entire AI section content with the new component
ai_section_pattern = r'(\s*{selectedMetric === \'accountability-coach\' && \(\s*<div>\s*<div style=\{{\s*background: \'rgba\(255, 255, 255, 0\.05\)\',.*?)\s*}\s*}\s*\)\s*</div>\s*\)\s*}\s*}'

replacement = '''
      {/* AI Accountability Coach Section */}
      {selectedMetric === 'accountability-coach' && <AIAccountabilityCoach />}'''

# Find and replace the entire AI section
match = re.search(ai_section_pattern, content, re.DOTALL)
if match:
    content = content[:match.start()] + replacement + content[match.end():]
    print("✅ Found and replaced AI section")
else:
    print("❌ Could not find AI section to replace")
    # Let's try a simpler approach - just add it at the end before closing
    insertion_point = content.rfind('    </div>\n  );\n};\n\nexport default ComprehensiveAnalytics;')
    if insertion_point != -1:
        new_section = '''
      {/* AI Accountability Coach Section */}
      {selectedMetric === 'accountability-coach' && <AIAccountabilityCoach />}
'''
        content = content[:insertion_point] + new_section + content[insertion_point:]
        print("✅ Added AI section at the end")

# Write the updated content
with open('ComprehensiveAnalytics.js', 'w') as f:
    f.write(content)

print("✅ AI Accountability Coach integration added to ComprehensiveAnalytics.js")
