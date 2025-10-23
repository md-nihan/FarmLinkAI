// Detailed instructions for Twilio WhatsApp Sandbox
console.log(`
📱 TWILIO WHATSAPP SANDBOX SETUP INSTRUCTIONS

=========================================

CURRENT SANDBOX STATUS:
- WhatsApp Number: +14155238886
- Your number (+919845325913) is already approved
- Other farmers need to be added manually

STEP-BY-STEP INSTRUCTIONS:

1. ACCESS TWILIO CONSOLE:
   🔗 URL: https://console.twilio.com
   🔐 Login with your Twilio credentials

2. NAVIGATE TO WHATSAPP SANDBOX:
   📱 Messaging > Try it out > WhatsApp Sandbox

3. TWO WAYS TO ADD FARMERS:

   METHOD A: FARMER SELF-REGISTRATION (Recommended)
   - When you approve a farmer in your admin panel, they automatically receive:
     "🎉 Congratulations [Name]!
     
     Your FarmLink AI account has been APPROVED! ✅
     
     You can now start listing your vegetables on our marketplace.
     
     FIRST STEP - Join WhatsApp:
     Please reply to this message with:
     
     join organization-organized
     
     (Just copy and send the above text)
     
     After joining, listing is easy:
     Just send: [Vegetable] [Quantity]
     
     Examples:
     ✅ Tomato 50kg
     ✅ Onion 100 kg
     ✅ Potato 200kg
     
     📸 You can attach photos for better prices!
     
     Welcome to FarmLink AI! 🧑‍🌾"

   - The farmer simply needs to copy and send "join organization-organized"
   - This automatically adds them to your sandbox

   METHOD B: MANUAL ADDITION (If farmer can't receive messages)
   - In the Twilio Console WhatsApp Sandbox page
   - There should be a section with:
     * Sandbox PIN: [4-digit code]
     * Join Message: "join [code]"
   - Have farmers send "join [code]" to +14155238886
   - Where [code] is the specific code shown in your console

4. VERIFY APPROVAL:
   - After farmers join, they can send messages like:
     "Tomato 20kg"
   - They should receive a confirmation message
   - Their products will appear on your marketplace

5. TROUBLESHOOTING:
   - If farmers don't receive messages:
     * Check if they're using the correct join message
     * Verify they're sending to +14155238886
     * Ensure they're not blocked by their carrier
     * Make sure they're not using WhatsApp Business (can cause issues)

6. PRODUCTION UPGRADE:
   - For unlimited farmers without manual approval:
     * Apply for WhatsApp Business API in Twilio Console
     * Go to WhatsApp > Learn > Apply for Production
     * This removes all sandbox restrictions

=========================================

📝 NOTES:
- The join message is CASE SENSITIVE
- Farmers must send the exact message format
- No need to manually add numbers in the console
- The system works through the join message process
- All approved farmers can receive messages automatically
`);

// Show the specific join message for your sandbox
console.log(`\n🎯 YOUR EXACT JOIN MESSAGE:`);
console.log(`join organization-organized\n`);