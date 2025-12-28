# UI/UX Design Guidelines for QuickXS

## Design Principles

### 1. Spacing & Layout
- **Consistent Spacing**: Use multiples of 4px (gap-3 = 12px, gap-4 = 16px, gap-6 = 24px)
- **Visual Hierarchy**: More space between major sections, less within components
- **Grid Alignment**: All elements align to a 12-column grid
- **Equal Heights**: Cards in the same row should have equal heights

### 2. Color Usage
- **Background**: #222831 (main background)
- **Cards**: #393E46 (component background)
- **Accent**: #00ADB5 (highlights, borders, CTAs)
- **Text**: #EEEEEE (primary text), opacity variations for hierarchy
- **Contrast**: Minimum 4.5:1 ratio for readability

### 3. Typography
- **Headings**: Bold, color: #00ADB5, size: text-xl (20px)
- **Body**: Regular, color: #EEEEEE, size: text-base (16px)
- **Secondary**: Opacity 0.7 for less important info
- **Line Height**: 1.5 for body, 1.2 for headings

### 4. Interactive Elements
- **Hover States**: Color change to #00ADB5, smooth transition (200-300ms)
- **Active States**: Slightly darker or scaled (0.95-1.05)
- **Focus**: Visible outline with #00ADB5
- **Disabled**: Opacity 0.5, no hover effects

### 5. Content Organization
- **Pagination**: Show max 10 items, add "Show more" button
- **Empty States**: Clear message with icon/emoji
- **Loading States**: Spinner with #00ADB5 color
- **Error States**: Clear message, retry option

### 6. Symmetry & Balance
- **Equal Column Widths**: Use grid with equal fractions
- **Aligned Elements**: Headers, content, footers align vertically
- **Consistent Padding**: Same padding for all cards (p-4 or p-6)
- **Visual Weight**: Balance left and right sides

### 7. Accessibility
- **Color Independence**: Don't rely solely on color
- **Touch Targets**: Minimum 44x44px for buttons
- **Keyboard Navigation**: Logical tab order
- **Screen Readers**: Proper ARIA labels

### 8. What NOT to Do
- ❌ Inconsistent spacing between sections
- ❌ Mixing different shades of the same color
- ❌ Overusing animations (keep subtle)
- ❌ Text smaller than 14px
- ❌ Long lists without pagination
- ❌ Cluttered layouts with too many elements
- ❌ Poor contrast ratios
- ❌ Inconsistent border styles
