const DataTamerSDK = require('@datatamer/data-tamer-sdk').default;

async function apiTokenManagementExample() {
  // Initialize SDK with existing API token
  const sdk = new DataTamerSDK({
    baseUrl: 'https://app.datatamer.ai/api',
    apiKey: 'your-api-token-here' // Get from account settings
  });

  console.log('🔐 Starting API Token Management Example\n');

  try {
    // 1. Get current user info
    console.log('👤 Getting current user information...');
    const currentUser = await sdk.users.getCurrentUser();
    console.log(`   User: ${currentUser.firstName} ${currentUser.lastName}`);
    console.log(`   Email: ${currentUser.email}`);
    console.log(`   Active: ${currentUser.isActive ? '✅' : '❌'}`);
    console.log();

    // 2. List existing API tokens
    console.log('🔑 Listing existing API tokens...');
    const existingTokens = await sdk.users.listApiTokens();
    console.log(`   Found ${existingTokens.length} existing tokens:`);
    
    existingTokens.forEach((token, index) => {
      console.log(`   ${index + 1}. ${token.name}`);
      console.log(`      ID: ${token.id}`);
      console.log(`      Created: ${new Date(token.created_at).toLocaleString()}`);
      console.log(`      Last used: ${token.last_used_at ? new Date(token.last_used_at).toLocaleString() : 'Never'}`);
    });
    console.log();

    // 3. Create a new API token for demonstration
    console.log('➕ Creating a new API token...');
    const newTokenRequest = {
      name: `SDK Example Token - ${new Date().toISOString().split('T')[0]}`
    };
    
    const createdToken = await sdk.users.createApiToken(newTokenRequest);
    console.log(`   ✅ Created token: ${createdToken.name}`);
    console.log(`   Token ID: ${createdToken.id}`);
    console.log(`   Token: ${createdToken.token.substring(0, 20)}...`);
    console.log(`   ⚠️ Note: The full token is only shown once during creation!`);
    console.log();

    // 4. Test the new token by creating a new SDK instance
    console.log('🧪 Testing the new token...');
    const testSdk = new DataTamerSDK({
      baseUrl: 'https://app.datatamer.ai/api',
      apiKey: createdToken.token
    });

    try {
      const testUser = await testSdk.users.getCurrentUser();
      console.log(`   ✅ Token works! Authenticated as: ${testUser.email}`);
      
      // Test some basic operations
      const workspaces = await testSdk.workspaces.listWorkspaces();
      console.log(`   📊 Can access ${workspaces.length} workspaces`);
      
    } catch (error) {
      console.log(`   ❌ Token test failed: ${error.message}`);
    }
    console.log();

    // 5. Demonstrate token usage patterns
    console.log('💡 Demonstrating different token usage patterns...\n');

    // Pattern 1: Environment variable
    console.log('   Pattern 1: Using environment variables');
    console.log('   ```bash');
    console.log('   export DATATAMER_API_TOKEN="your-token-here"');
    console.log('   node your-app.js');
    console.log('   ```');
    console.log('   ```javascript');
    console.log('   const sdk = new DataTamerSDK({');
    console.log('     baseUrl: "https://app.datatamer.ai/api",');
    console.log('     apiKey: process.env.DATATAMER_API_TOKEN');
    console.log('   });');
    console.log('   ```\n');

    // Pattern 2: Configuration file
    console.log('   Pattern 2: Using configuration file');
    console.log('   ```javascript');
    console.log('   // config.json');
    console.log('   {');
    console.log('     "datatamer": {');
    console.log('       "apiToken": "your-token-here",');
    console.log('       "baseUrl": "https://app.datatamer.ai/api"');
    console.log('     }');
    console.log('   }');
    console.log('   ');
    console.log('   // app.js');
    console.log('   const config = require("./config.json");');
    console.log('   const sdk = new DataTamerSDK({');
    console.log('     baseUrl: config.datatamer.baseUrl,');
    console.log('     apiKey: config.datatamer.apiToken');
    console.log('   });');
    console.log('   ```\n');

    // Pattern 3: Dynamic token rotation
    console.log('   Pattern 3: Dynamic token rotation');
    console.log('   ```javascript');
    console.log('   class TokenManager {');
    console.log('     async rotateToken() {');
    console.log('       // Create new token');
    console.log('       const newToken = await this.sdk.users.createApiToken({');
    console.log('         name: `Auto-rotated-${Date.now()}`');
    console.log('       });');
    console.log('       ');
    console.log('       // Update SDK with new token');
    console.log('       this.sdk.setAllApiKey(newToken.token);');
    console.log('       ');
    console.log('       // Delete old token (if needed)');
    console.log('       await this.sdk.users.deleteApiToken(this.oldTokenId);');
    console.log('     }');
    console.log('   }');
    console.log('   ```\n');

    // 6. Security best practices
    console.log('🛡️ Security Best Practices:\n');
    console.log('   1. 🔒 Never commit tokens to version control');
    console.log('   2. 🔄 Rotate tokens regularly');
    console.log('   3. 📝 Use descriptive names for token identification');
    console.log('   4. 🗑️ Delete unused tokens promptly');
    console.log('   5. 🔍 Monitor token usage in your account');
    console.log('   6. 💾 Store tokens securely (env vars, secrets management)');
    console.log('   7. 🚫 Use different tokens for different environments');
    console.log();

    // 7. List tokens again to show the new one
    console.log('🔍 Updated token list:');
    const updatedTokens = await sdk.users.listApiTokens();
    console.log(`   Total tokens: ${updatedTokens.length}`);
    
    updatedTokens.forEach((token, index) => {
      const isNew = token.id === createdToken.id;
      console.log(`   ${index + 1}. ${token.name} ${isNew ? '🆕' : ''}`);
    });
    console.log();

    // 8. Clean up - delete the example token
    console.log('🧹 Cleaning up example token...');
    try {
      await sdk.users.deleteApiToken(createdToken.id);
      console.log(`   ✅ Deleted token: ${createdToken.name}`);
    } catch (error) {
      console.log(`   ⚠️ Could not delete token: ${error.message}`);
      console.log(`   You may need to delete it manually from your account settings`);
    }
    console.log();

    // 9. Final token count
    const finalTokens = await sdk.users.listApiTokens();
    console.log(`📊 Final token count: ${finalTokens.length}`);
    
    console.log('\n✅ API Token Management example completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Create a permanent token for your application');
    console.log('   2. Store it securely as an environment variable');
    console.log('   3. Use it in your production applications');
    console.log('   4. Set up regular token rotation if needed');

  } catch (error) {
    console.error('❌ Error during token management example:', error.message);
    if (error.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }
    if (error.details) {
      console.error('   Details:', error.details);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure your API token is valid and has not expired');
    console.log('   2. Check that you have permission to manage API tokens');
    console.log('   3. Verify the base URL is correct');
    console.log('   4. Make sure your account is active');
  }
}

// Show usage information
function showUsage() {
  console.log(`
API Token Management Example Usage:

1. Get an API token from your DataTamer account settings
2. Update the apiKey in the code with your token
3. Run: node api-token-management.js

This example demonstrates:
- 🔍 Listing existing API tokens
- ➕ Creating new API tokens
- 🧪 Testing token authentication
- 💡 Best practices for token management
- 🛡️ Security considerations
- 🧹 Cleaning up unused tokens

The example creates a temporary token for testing and then deletes it.
Your original token will remain intact.

For production use:
- Store tokens as environment variables
- Use descriptive names for identification
- Rotate tokens regularly
- Delete unused tokens promptly
`);
}

// Run the example
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
  } else {
    apiTokenManagementExample().catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
  }
}

module.exports = apiTokenManagementExample;