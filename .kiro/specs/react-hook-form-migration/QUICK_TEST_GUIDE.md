# Quick Manual Testing Guide

## 🚀 Server Status
✅ Development server is running at: **http://localhost:3000/**

---

## 📋 Quick Test Checklist

### MarketplaceForm (5 tests - ~5 minutes)

1. **✅ Valid submission**
   - Enter "Amazon" → Click "Add Marketplace"
   - Expect: Success toast, form clears, marketplace appears in list

2. **✅ Empty name validation**
   - Leave input empty → Click "Add Marketplace"
   - Expect: Red error "Marketplace name is required"

3. **✅ Whitespace validation**
   - Enter "   " (spaces only) → Click "Add Marketplace"
   - Expect: Red error "Marketplace name is required"

4. **✅ Long name validation**
   - Enter 256+ characters → Click "Add Marketplace"
   - Expect: Red error "Marketplace name must be 255 characters or less"

5. **✅ Loading state**
   - Submit form → Observe button and input
   - Expect: Button shows "Adding...", input disabled

---

### SalesEntryForm (10 tests - ~10 minutes)

6. **✅ Valid submission**
   - Select marketplace → Pick today's date → Enter "100.50" → Click "Add Entry"
   - Expect: Success toast, form clears, entry appears in history

7. **✅ Missing marketplace**
   - Leave dropdown at "Select a marketplace" → Fill other fields → Submit
   - Expect: Red error "Marketplace selection is required"

8. **✅ Missing date**
   - Select marketplace → Leave date empty → Enter amount → Submit
   - Expect: Red error "Date is required"

9. **✅ Future date**
   - Select marketplace → Try to enter future date → Submit
   - Expect: Red error "Sales date cannot be in the future"

10. **✅ Missing amount**
    - Select marketplace → Pick date → Leave amount empty → Submit
    - Expect: Red error "Sales amount is required"

11. **✅ Negative amount**
    - Select marketplace → Pick date → Enter "-50" → Submit
    - Expect: Red error "Sales amount must be non-negative"

12. **✅ Edit mode - Load**
    - Click edit on existing entry
    - Expect: Form title "Edit Sales Entry", fields pre-filled, Cancel button appears

13. **✅ Edit mode - Update**
    - Edit an entry → Change amount → Click "Update Entry"
    - Expect: Success toast "Sales entry updated successfully!", changes saved

14. **✅ Edit mode - Cancel**
    - Click edit → Click "Cancel"
    - Expect: Edit mode closes, no changes saved

15. **✅ Loading state**
    - Submit form → Observe button and inputs
    - Expect: Button shows "Saving...", all inputs disabled

---

## 🎨 Visual Verification (2 minutes)

Open browser DevTools (F12) and verify:

1. **HTML Structure**
   - Same div nesting as before
   - Same form element hierarchy

2. **CSS Classes**
   - Inputs: `px-4 py-3 bg-white border border-gray-200 rounded-full/rounded-lg`
   - Buttons: `bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300`
   - Errors: `text-red-600 text-sm`

3. **Error Positioning**
   - Errors appear below their respective inputs
   - Proper spacing with `mt-1`

---

## 📊 Code Reduction Verification

Review the CODE_COMPARISON.md file to see:
- **MarketplaceForm**: 30-35% reduction ✅
- **SalesEntryForm**: 30-32% reduction ✅
- **Overall**: 31-33% reduction ✅

---

## ✅ Success Criteria

All tests should pass with:
- ✅ Correct validation messages
- ✅ Proper form submission
- ✅ Success/error toasts
- ✅ Form clearing behavior
- ✅ Edit mode functionality
- ✅ Loading states
- ✅ Visual parity

---

## 📝 Detailed Documentation

For comprehensive test cases and expected results, see:
- **MANUAL_TESTING_RESULTS.md** - Detailed test cases
- **CODE_COMPARISON.md** - Before/after code comparison
- **VERIFICATION_SUMMARY.md** - Complete verification status

---

## 🎯 Estimated Time

- **MarketplaceForm tests**: ~5 minutes
- **SalesEntryForm tests**: ~10 minutes
- **Visual verification**: ~2 minutes
- **Total**: ~17 minutes

---

## 🐛 If You Find Issues

If any test fails:
1. Note which test case failed
2. Document the actual vs expected behavior
3. Check browser console for errors
4. Report findings for investigation

---

## ✨ Migration Benefits

After testing, you'll have verified:
- ✅ 31-33% less code
- ✅ Type-safe validation with Zod
- ✅ No manual state management
- ✅ Industry-standard patterns
- ✅ Better performance
- ✅ Easier maintenance
