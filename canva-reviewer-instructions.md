# Write Our Heart - Canva Integration Test Instructions

## Test Account Access
**URL:** https://beta.writeourheart.com
**Test Email:** canva-test@writeourheart.com
**Test Password:** CanvaTest2024!

## How to Test the Integration

### Step 1: Create Account/Login
1. Go to https://beta.writeourheart.com
2. Use the test credentials above OR create a new account
3. Choose "Legacy Plan" for full testing capabilities

### Step 2: Create a Heart (Recipient)
1. Click "Add New Heart" 
2. Fill in recipient details:
   - Name: John Doe
   - Address: 123 Test St, Test City, CA 90210
   - Relationship: Friend
   - Occasions: Birthday, Anniversary
   - Dates: Set upcoming dates

### Step 3: Test Card Production
1. Go to "Card Production Dashboard"
2. Click "Connect to Canva" 
3. Authorize the integration
4. Select a heart and occasion
5. Generate artwork (Leonardo.ai)
6. Generate poetry (OpenAI)
7. Create card design in Canva

### Step 4: Expected Workflow
1. **AI Artwork Generation:** Beautiful, occasion-specific background
2. **Poetry Generation:** Personalized message based on relationship
3. **Canva Integration:** Combine artwork + poetry in professional layout
4. **Export:** Download print-ready PDF

## Test Scenarios
- Birthday card for friend
- Anniversary card for spouse  
- Thank you card for colleague
- Holiday card for family

## Integration Points
- **Leonardo.ai:** Artwork generation
- **OpenAI:** Poetry writing
- **Canva:** Design assembly and export

## Expected Permissions
- design:content:read
- design:content:write
- design:meta:read

## Support Contact
Email: support@writeourheart.com
For any testing questions or issues
