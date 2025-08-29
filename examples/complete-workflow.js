const DataTamerSDK = require('@datatamer/data-tamer-sdk').default;

async function completeWorkflowExample() {
  console.log('🚀 Starting Complete DataTamer Workflow Example\n');

  try {
    // Step 1: Login user account (using existing API token)
    console.log('🔐 Step 1: Login user account...');
    const sdk = new DataTamerSDK({
      baseUrl: 'https://app.datatamer.ai/api',
      apiKey: process.env.DATATAMER_API_TOKEN || 'your-api-token-here'
    });

    // Verify authentication by getting current user
    const currentUser = await sdk.users.getCurrentUser();
    console.log(`   ✅ Logged in as: ${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})`);
    console.log();

    // Step 2: Create user token
    console.log('🔑 Step 2: Create user token...');
    const tokenRequest = {
      name: `Complete Workflow Token - ${new Date().toISOString().split('T')[0]}`
    };
    
    const userToken = await sdk.users.createApiToken(tokenRequest);
    console.log(`   ✅ Created user token: ${userToken.name}`);
    console.log(`   Token ID: ${userToken.id}`);
    console.log(`   Token: ${userToken.token.substring(0, 20)}...`);
    console.log();

    // Step 3: Create SDK instance with user token
    console.log('🔧 Step 3: Using user token for subsequent operations...');
    const userSdk = new DataTamerSDK({
      baseUrl: 'https://app.datatamer.ai/api',
      apiKey: userToken.token
    });

    // Verify the token works
    const tokenUser = await userSdk.users.getCurrentUser();
    console.log(`   ✅ Token authenticated as: ${tokenUser.email}`);
    console.log();

    // Step 4: Select default workspace or create it
    console.log('🏢 Step 4: Select the default workspace (create if doesn\'t exist)...');
    let workspaces = await userSdk.workspaces.listWorkspaces();
    console.log(`   Found ${workspaces.length} existing workspaces`);

    let workspace;
    if (workspaces.length === 0) {
      console.log('   No workspaces found. Creating default workspace...');
      const workspaceResult = await userSdk.workspaces.createWorkspace({
        name: 'Default Workspace',
        description: 'Default workspace created by complete workflow example'
      });
      workspace = workspaceResult.organization;
      console.log(`   ✅ Created workspace: ${workspace.name} (${workspace.id})`);
    } else {
      workspace = workspaces[0];
      console.log(`   ✅ Using existing workspace: ${workspace.name} (${workspace.id})`);
    }
    console.log();

    // Step 5: Create a topic
    console.log('📁 Step 5: Create a topic...');
    const topicData = {
      name: 'Complete Workflow Topic',
      description: 'Topic created by the complete workflow example',
      organizationId: workspace.id
    };

    const topic = await userSdk.topics.createTopic(topicData);
    console.log(`   ✅ Created topic: ${topic.name} (${topic.id})`);
    console.log();

    // Step 6: Add a stream datasource
    console.log('🌊 Step 6: Add a stream datasource...');
    const streamDatasource = await userSdk.datasources.create({
      name: 'Complete Workflow Stream',
      description: 'Stream datasource for complete workflow example',
      organizationId: workspace.id,
      datasourceType: 'STREAM',
      configuration: {
        streamConfig: {
          format: 'json',
          encoding: 'utf8',
          batchSize: 100,
          flushInterval: 5000
        }
      }
    });
    
    console.log(`   ✅ Created stream datasource: ${streamDatasource.name} (${streamDatasource.id})`);
    console.log();

    // Step 7: Add tamed data using the stream datasource to the topic
    console.log('🎯 Step 7: Add tamed data using the stream datasource...');
    const tamedData = await userSdk.tamedData.create({
      name: 'Complete Workflow Tamed Data',
      description: 'Tamed data created by complete workflow example',
      projectId: topic.id,
      datasourceId: streamDatasource.id,
      dataType: 'stream',
      configuration: {
        format: 'json',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            timestamp: { type: 'string' },
            message: { type: 'string' },
            metadata: { type: 'object' }
          }
        }
      }
    });

    console.log(`   ✅ Created tamed data: ${tamedData.name} (${tamedData.id})`);
    console.log();

    // Step 8: Create a token for the stream datasource
    console.log('🔐 Step 8: Create a token for the stream datasource...');
    const streamApiKey = await userSdk.tamedData.generateApiKey(tamedData.id);
    console.log(`   ✅ Generated stream API key: ${streamApiKey.apiKey.substring(0, 20)}...`);
    console.log();

    // Step 9: Push a payload to the stream
    console.log('📤 Step 9: Push a payload to the stream...');
    const samplePayloads = [
      {
        content: {
          id: 'msg001',
          timestamp: new Date().toISOString(),
          message: 'Hello from complete workflow!',
          metadata: {
            source: 'complete-workflow-example',
            version: '1.0.0',
            tags: ['example', 'workflow', 'stream']
          }
        },
        metadata: {
          ingestionTime: new Date().toISOString(),
          source: 'sdk-example'
        }
      },
      {
        content: {
          id: 'msg002',
          timestamp: new Date().toISOString(),
          message: 'Second message from workflow',
          metadata: {
            source: 'complete-workflow-example',
            version: '1.0.0',
            tags: ['example', 'workflow', 'stream', 'batch']
          }
        },
        metadata: {
          ingestionTime: new Date().toISOString(),
          source: 'sdk-example'
        }
      },
      {
        content: {
          id: 'msg003',
          timestamp: new Date().toISOString(),
          message: 'Third message with different content',
          metadata: {
            source: 'complete-workflow-example',
            version: '1.0.0',
            tags: ['example', 'workflow', 'final']
          }
        },
        metadata: {
          ingestionTime: new Date().toISOString(),
          source: 'sdk-example'
        }
      }
    ];

    for (let i = 0; i < samplePayloads.length; i++) {
      const payload = samplePayloads[i];
      const result = await userSdk.tamedData.sendToStream(
        tamedData.id,
        streamApiKey.apiKey,
        payload
      );
      
      console.log(`   ✅ Pushed payload ${i + 1}: ${result.success ? 'Success' : 'Failed'}`);
      if (result.messageId) {
        console.log(`      Message ID: ${result.messageId}`);
      }
      
      // Small delay between messages to simulate real-world usage
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log();

    // Step 10: RAG search the tamed data
    console.log('🔍 Step 10: RAG search the tamed data...');
    
    // Wait a moment for data to be processed
    console.log('   Waiting for data processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const searchQueries = [
      'workflow',
      'complete workflow example',
      'Hello from complete',
      'metadata source'
    ];

    for (const query of searchQueries) {
      try {
        const searchResults = await userSdk.tamedData.searchStream(
          tamedData.id,
          streamApiKey.apiKey,
          {
            query: query,
            limit: 5
          }
        );

        console.log(`   🔍 Search for "${query}":`);
        console.log(`      Found ${searchResults.results.length} results (total: ${searchResults.total})`);
        
        searchResults.results.forEach((result, index) => {
          console.log(`      ${index + 1}. ID: ${result.content?.id || 'N/A'}`);
          console.log(`         Message: ${result.content?.message?.substring(0, 50) || 'N/A'}...`);
        });
        
        console.log();
      } catch (searchError) {
        console.log(`   ⚠️ Search for "${query}" failed: ${searchError.message}`);
        console.log();
      }
    }

    // Additional verification: Get stream data
    console.log('📊 Verifying stream data...');
    try {
      const streamData = await userSdk.tamedData.getStreamData(tamedData.id, streamApiKey.apiKey);
      console.log(`   ✅ Retrieved ${streamData.streamData?.length || 0} stream data entries`);
      console.log(`   Tamed data status: ${streamData.tamedData.status}`);
    } catch (error) {
      console.log(`   ⚠️ Could not retrieve stream data: ${error.message}`);
    }
    console.log();

    // Step 11: End execution with cleanup
    console.log('🧹 Step 11: Cleanup and end execution...');
    
    // Clean up the created user token
    try {
      await sdk.users.deleteApiToken(userToken.id);
      console.log(`   ✅ Deleted user token: ${userToken.name}`);
    } catch (error) {
      console.log(`   ⚠️ Could not delete user token: ${error.message}`);
    }

    console.log('   📋 Resources created (you may want to clean up manually):');
    console.log(`      • Workspace: ${workspace.name} (${workspace.id})`);
    console.log(`      • Topic: ${topic.name} (${topic.id})`);
    console.log(`      • Stream Datasource: ${streamDatasource.name} (${streamDatasource.id})`);
    console.log(`      • Tamed Data: ${tamedData.name} (${tamedData.id})`);
    console.log();

    console.log('✅ Complete workflow example finished successfully!');
    console.log();
    console.log('📝 Summary of what was accomplished:');
    console.log('   1. ✅ Authenticated user account');
    console.log('   2. ✅ Created user API token');
    console.log('   3. ✅ Used user token for authentication');
    console.log('   4. ✅ Selected/created default workspace');
    console.log('   5. ✅ Created a topic');
    console.log('   6. ✅ Added a stream datasource');
    console.log('   7. ✅ Created tamed data using the stream datasource');
    console.log('   8. ✅ Generated API key for stream access');
    console.log('   9. ✅ Pushed multiple payloads to the stream');
    console.log('   10. ✅ Performed RAG searches on the tamed data');
    console.log('   11. ✅ Cleaned up temporary resources');

  } catch (error) {
    console.error('❌ Error during complete workflow execution:', error.message);
    
    if (error.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }
    
    if (error.details) {
      console.error('   Details:', error.details);
    }
    
    console.log();
    console.log('🔧 Troubleshooting:');
    console.log('   1. Ensure your API token is valid and has not expired');
    console.log('   2. Check that you have the necessary permissions');
    console.log('   3. Verify the base URL is correct');
    console.log('   4. Make sure your account is active and has sufficient credits');
    console.log('   5. Check that stream processing services are available');
    
    // Exit with error code
    process.exit(1);
  }
}

// Usage information
function showUsage() {
  console.log(`
Complete DataTamer Workflow Example Usage:

1. Set your API token as an environment variable:
   export DATATAMER_API_TOKEN="your-api-token-here"

2. Run the example:
   node complete-workflow.js

This example demonstrates the complete DataTamer workflow:

🔐 Authentication & Token Management:
   • Login with user account
   • Create user API tokens
   • Use tokens for authentication

🏢 Workspace & Topic Management:  
   • Select default workspace (create if needed)
   • Create topics for organizing data

🌊 Data Sources & Streaming:
   • Create stream datasources
   • Configure tamed data with stream sources
   • Generate API keys for stream access

📤 Data Ingestion:
   • Push payloads to streams
   • Handle stream data with metadata

🔍 Data Search & Retrieval:
   • Perform RAG searches on tamed data
   • Retrieve and verify stream data

🧹 Resource Management:
   • Clean up temporary resources
   • Best practices for resource lifecycle

Environment Variables:
   DATATAMER_API_TOKEN - Your DataTamer API token (required)

For production use:
   • Store sensitive tokens securely
   • Implement proper error handling
   • Use appropriate retry mechanisms
   • Monitor resource usage and costs
   • Implement proper cleanup procedures
`);
}

// Run the example
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
  } else {
    completeWorkflowExample().catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
  }
}

module.exports = completeWorkflowExample;