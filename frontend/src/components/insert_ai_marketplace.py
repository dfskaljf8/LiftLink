import re

# Read the current file
with open('TrainerMarketplace.js', 'r') as f:
    content = f.read()

# Find the insertion point (after the header section)
insertion_point = content.find('      {/* Search and Filters */')

if insertion_point == -1:
    print("Could not find insertion point")
    exit(1)

# The content to insert
view_mode_selector = '''
      {/* View Mode Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => setViewMode('grid')}
          style={{
            background: viewMode === 'grid' ? '#C4D600' : 'rgba(255, 255, 255, 0.1)',
            color: viewMode === 'grid' ? '#000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📋 Browse All
        </button>
        <button
          onClick={() => setViewMode('list')}
          style={{
            background: viewMode === 'list' ? '#C4D600' : 'rgba(255, 255, 255, 0.1)',
            color: viewMode === 'list' ? '#000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📋 List View
        </button>
        <button
          onClick={() => setViewMode('ai-matchmaker')}
          style={{
            background: viewMode === 'ai-matchmaker' ? '#C4D600' : 'rgba(255, 255, 255, 0.1)',
            color: viewMode === 'ai-matchmaker' ? '#000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🎯 AI Matchmaker
        </button>
      </div>

      {/* AI Fitness Matchmaker View */}
      {viewMode === 'ai-matchmaker' && <AIFitnessMatchmaker />}

      {/* Regular Marketplace Views */}
      {viewMode !== 'ai-matchmaker' && (
        <>

'''

# Insert the content
new_content = content[:insertion_point] + view_mode_selector + content[insertion_point:]

# Also need to close the conditional wrapper at the end
# Find the end of the component
end_pattern = r'(\s*{/\* Booking Modal \*/\}\s*{showBookingModal && <BookingModal />}\s*</div>\s*\);\s*};\s*export default TrainerMarketplace;)'

match = re.search(end_pattern, new_content)
if match:
    # Insert the closing bracket before the booking modal and export
    closing_bracket = '\n        </>\n      )}\n'
    insert_pos = match.start()
    new_content = new_content[:insert_pos] + closing_bracket + new_content[insert_pos:]

# Write the updated content
with open('TrainerMarketplace.js', 'w') as f:
    f.write(new_content)

print("✅ AI Fitness Matchmaker integration added to TrainerMarketplace.js")
