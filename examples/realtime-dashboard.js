const DataTamerSDK = require('@datatamer/data-tamer-sdk').default;

async function realtimeDashboardExample() {
  // Initialize SDK with API token
  const sdk = new DataTamerSDK({
    baseUrl: 'https://app.datatamer.ai/api',
    apiKey: 'your-api-token-here' // Get from account settings
  });

  console.log('🚀 Starting Real-time Dashboard Example\n');

  try {
    // Get basic data first
    const workspaces = await sdk.workspaces.listWorkspaces();
    if (workspaces.length === 0) {
      console.log('❌ No workspaces found. Please create one first.');
      return;
    }

    const workspace = workspaces[0];
    const topics = await sdk.topics.listTopics(workspace.id);
    
    console.log(`📊 Monitoring workspace: ${workspace.name}`);
    console.log(`📁 Topics: ${topics.length}`);
    console.log();

    // Set up real-time connection
    console.log('🔌 Connecting to real-time stream...');
    
    await sdk.realtime.connect({
      reconnect: true,
      maxReconnectAttempts: 10,
      reconnectInterval: 2000
    }, {
      onOpen: () => {
        console.log('✅ Connected to real-time stream');
        console.log('📡 Listening for events...\n');
      },
      onError: (error) => {
        console.error('❌ Real-time connection error:', error.message || error);
      },
      onReconnect: (attempt) => {
        console.log(`🔄 Reconnecting... (attempt ${attempt})`);
      },
      onReconnectFailed: () => {
        console.error('❌ Failed to reconnect after maximum attempts');
      }
    });

    // Enable auto-reconnect with exponential backoff
    sdk.realtime.enableAutoReconnect(1000, 30000, 15);

    // Subscribe to different event types
    console.log('🎯 Setting up event subscriptions...\n');

    // 1. Notification events
    const unsubscribeNotifications = sdk.realtime.onNotifications((notification) => {
      console.log('🔔 NEW NOTIFICATION:');
      console.log(`   Type: ${notification.type}`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Time: ${new Date(notification.createdAt).toLocaleTimeString()}`);
      console.log();
    });

    // 2. Datasource updates
    const unsubscribeDatasources = sdk.realtime.onDatasourceUpdates((update) => {
      console.log('🗄️ DATASOURCE UPDATE:');
      console.log(`   Datasource ID: ${update.datasourceId}`);
      console.log(`   Status: ${update.status}`);
      console.log(`   Message: ${update.message || 'No message'}`);
      console.log(`   Time: ${new Date().toLocaleTimeString()}`);
      console.log();
    });

    // 3. Topic updates
    const unsubscribeTopics = sdk.realtime.onProjectUpdates((update) => {
      console.log('📁 TOPIC UPDATE:');
      console.log(`   Topic ID: ${update.projectId}`);
      console.log(`   Event: ${update.event}`);
      console.log(`   Details: ${JSON.stringify(update.details, null, 2)}`);
      console.log(`   Time: ${new Date().toLocaleTimeString()}`);
      console.log();
    });

    // 4. AI responses
    const unsubscribeAI = sdk.realtime.onAIResponses((response) => {
      console.log('🤖 AI RESPONSE:');
      console.log(`   Conversation ID: ${response.conversationId}`);
      console.log(`   Message ID: ${response.messageId}`);
      console.log(`   Content: ${response.content.substring(0, 100)}${response.content.length > 100 ? '...' : ''}`);
      console.log(`   Complete: ${response.isComplete}`);
      console.log(`   Time: ${new Date().toLocaleTimeString()}`);
      console.log();
    });

    // 5. Custom event filtering
    const unsubscribeFiltered = sdk.realtime.onAllEvents(
      (eventType, data) => {
        // Only show error events
        return eventType.toLowerCase().includes('error') || 
               (data && data.status && data.status.toLowerCase().includes('error'));
      },
      (eventType, data) => {
        console.log('⚠️ ERROR EVENT DETECTED:');
        console.log(`   Event Type: ${eventType}`);
        console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
        console.log(`   Time: ${new Date().toLocaleTimeString()}`);
        console.log();
      }
    );

    // Display connection status periodically
    const statusInterval = setInterval(() => {
      const connectionState = sdk.realtime.getConnectionState();
      console.log(`📊 Connection Status: ${connectionState.connected ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`   Ready State: ${connectionState.readyState}`);
      console.log(`   Reconnect Attempts: ${connectionState.reconnectAttempts}`);
      console.log();
    }, 30000); // Every 30 seconds

    // Simulate some dashboard updates
    console.log('🎭 Simulating dashboard activity...\n');
    
    // Create some test data to trigger events (if applicable)
    setTimeout(async () => {
      try {
        // Try to create a topic action to potentially trigger events
        if (topics.length > 0) {
          await sdk.topics.addTopicAction(topics[0].id, {
            name: 'Real-time Test Action',
            description: 'Action created by real-time dashboard example',
            actionType: 'test',
            parameters: { timestamp: new Date().toISOString() }
          });
          console.log('✨ Created test action to potentially trigger events');
        }
      } catch (error) {
        console.log('ℹ️ Could not create test action (this is normal)');
      }
    }, 5000);

    // Set up dashboard data refresh
    const refreshDashboard = async () => {
      try {
        console.log('📈 Refreshing dashboard data...');
        
        // Get latest stats
        const [currentWorkspaces, currentTopics, currentDatasources] = await Promise.all([
          sdk.workspaces.listWorkspaces(),
          sdk.topics.listTopics(workspace.id),
          sdk.datasources.listForWorkspace(workspace.id)
        ]);

        console.log(`📊 DASHBOARD REFRESH (${new Date().toLocaleTimeString()}):`);
        console.log(`   Workspaces: ${currentWorkspaces.length}`);
        console.log(`   Topics: ${currentTopics.length}`);
        console.log(`   Datasources: ${currentDatasources.length}`);

        // Get topic stats if we have topics
        if (currentTopics.length > 0) {
          try {
            const topicStats = await sdk.topics.getTopicStats(currentTopics[0].id);
            console.log(`   Topic Users: ${topicStats.totalUsers}`);
            console.log(`   Topic Actions: ${topicStats.totalActions}`);
            console.log(`   Tamed Data: ${topicStats.totalTamedData}`);
          } catch (error) {
            console.log(`   Topic stats not available`);
          }
        }

        console.log();
      } catch (error) {
        console.error('❌ Error refreshing dashboard:', error.message);
      }
    };

    // Refresh dashboard every minute
    const dashboardInterval = setInterval(refreshDashboard, 60000);

    // Initial dashboard refresh
    await refreshDashboard();

    console.log('👂 Dashboard is now listening for real-time events...');
    console.log('   Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    const cleanup = () => {
      console.log('\n🛑 Shutting down real-time dashboard...');
      
      // Clear intervals
      clearInterval(statusInterval);
      clearInterval(dashboardInterval);
      
      // Unsubscribe from events
      unsubscribeNotifications();
      unsubscribeDatasources();
      unsubscribeTopics();
      unsubscribeAI();
      unsubscribeFiltered();
      
      // Disconnect from real-time stream
      sdk.realtime.disconnect();
      
      console.log('✅ Cleanup completed. Goodbye!');
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Keep the process running
    process.stdin.resume();

  } catch (error) {
    console.error('❌ Error during real-time dashboard setup:', error.message);
    if (error.status) {
      console.error(`HTTP Status: ${error.status}`);
    }
    process.exit(1);
  }
}

// Show usage information
function showUsage() {
  console.log(`
Real-time Dashboard Example Usage:

1. Make sure you have access to your DataTamer account
2. Update the apiKey in the code with your API token from account settings
3. Run: node realtime-dashboard.js

This example will:
- Connect to the real-time event stream
- Subscribe to various event types
- Display events as they occur
- Periodically refresh dashboard statistics
- Handle reconnections automatically

Events monitored:
- 🔔 Notifications
- 🗄️ Datasource updates  
- 📁 Topic updates
- 🤖 AI responses
- ⚠️ Error events

Press Ctrl+C to stop the dashboard.
`);
}

// Run the example
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
  } else {
    realtimeDashboardExample().catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
  }
}

module.exports = realtimeDashboardExample;