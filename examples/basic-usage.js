const DataTamerSDK = require('@datatamer/data-tamer-sdk').default;

async function basicUsageExample() {
  // Initialize SDK with API token (recommended)
  const sdk = new DataTamerSDK({
    baseUrl: 'https://app.datatamer.ai/api',
    apiKey: 'your-api-token-here' // Get from account settings
  });

  try {
    console.log('🚀 Starting Data Tamer SDK Basic Usage Example\n');

    // 1. Health Check
    console.log('📊 Checking SDK health...');
    const health = await sdk.healthCheck();
    console.log('Health status:', health.status);
    console.log('Services:', health.services);
    console.log();

    // 2. List Workspaces
    console.log('🏢 Fetching workspaces...');
    const workspaces = await sdk.workspaces.listWorkspaces();
    console.log(`Found ${workspaces.length} workspaces`);
    
    if (workspaces.length === 0) {
      console.log('No workspaces found. Creating one...');
      const newWorkspace = await sdk.workspaces.createWorkspace({
        name: 'Example Workspace',
        description: 'Created by SDK example'
      });
      workspaces.push(newWorkspace);
    }

    const workspace = workspaces[0];
    console.log(`Using workspace: ${workspace.name} (${workspace.id})`);
    console.log();

    // 3. List Topics
    console.log('📁 Fetching topics...');
    const topics = await sdk.topics.listTopics(workspace.id);
    console.log(`Found ${topics.length} topics in workspace`);

    // Create a topic if none exist
    let topic;
    if (topics.length === 0) {
      console.log('Creating a sample topic...');
      topic = await sdk.topics.createTopic({
        name: 'SDK Example Topic',
        description: 'A topic created by the SDK example',
        organizationId: workspace.id
      });
      console.log(`Created topic: ${topic.name} (${topic.id})`);
    } else {
      topic = topics[0];
      console.log(`Using existing topic: ${topic.name} (${topic.id})`);
    }
    console.log();

    // 4. List Datasources
    console.log('🗄️ Fetching datasources...');
    const datasources = await sdk.datasources.listForWorkspace(workspace.id);
    console.log(`Found ${datasources.length} datasources`);

    // Create a sample datasource
    if (datasources.length === 0) {
      console.log('Creating a sample CSV datasource...');
      const datasource = await sdk.datasources.create({
        name: 'Sample CSV Data',
        description: 'Example CSV datasource',
        organizationId: workspace.id, // API expects organizationId
        datasourceType: 'CSV',
        configuration: {
          filePath: '/tmp/sample.csv',
          hasHeader: true,
          delimiter: ','
        }
      });
      console.log(`Created datasource: ${datasource.name} (${datasource.id})`);
      datasources.push(datasource);
    }
    console.log();

    // 5. List Tamed Data
    console.log('🎯 Fetching tamed data...');
    const tamedDataList = await sdk.tamedData.getByProject(topic.id);
    console.log(`Found ${tamedDataList.length} tamed data entries`);

    // Create tamed data if none exist and we have datasources
    if (tamedDataList.length === 0 && datasources.length > 0) {
      console.log('Creating sample tamed data...');
      const tamedData = await sdk.tamedData.create({
        name: 'Processed Sample Data',
        description: 'Tamed data created by SDK example',
        projectId: topic.id, // API expects projectId
        datasourceId: datasources[0].id,
        dataType: 'tabular',
        configuration: {
          format: 'parquet',
          compression: 'snappy'
        }
      });
      console.log(`Created tamed data: ${tamedData.name} (${tamedData.id})`);
    }
    console.log();

    // 6. Get Conversations
    console.log('💬 Fetching conversation history...');
    const conversations = await sdk.conversations.getHistory(workspace.id, topic.id);
    console.log(`Found ${conversations.length} conversations`);

    // Start a conversation if none exist
    if (conversations.length === 0) {
      console.log('Starting a new AI conversation...');
      const { conversation, response } = await sdk.conversations.startConversation(
        workspace.id,
        topic.id,
        'Hello! Can you help me analyze my data?',
        'SDK Example Conversation'
      );
      console.log(`Started conversation: ${conversation.title}`);
      console.log(`AI Response: ${response.content.substring(0, 100)}...`);
    }
    console.log();

    // 7. Get Billing Information
    console.log('💰 Checking billing status...');
    try {
      const billingHistory = await sdk.billing.getHistoryForWorkspace(workspace.id);
      console.log(`Found ${billingHistory.length} billing entries`);
      
      const subscriptionStatus = await sdk.billing.getSubscriptionStatus();
      console.log(`Subscription status: ${subscriptionStatus.status}`);
      console.log(`Has active subscription: ${subscriptionStatus.hasActiveSubscription}`);
    } catch (error) {
      console.log('Billing information not available (might not be set up)');
    }
    console.log();

    // 8. Topic Statistics
    console.log('📈 Getting topic statistics...');
    try {
      const topicStats = await sdk.topics.getTopicStats(topic.id);
      console.log('Topic Stats:', {
        totalUsers: topicStats.totalUsers,
        totalActions: topicStats.totalActions,
        totalTamedData: topicStats.totalTamedData,
        lastActivity: topicStats.lastActivity
      });
    } catch (error) {
      console.log('Topic statistics not available');
    }
    console.log();

    // 9. Workspace Dashboard
    console.log('📊 Getting workspace dashboard...');
    try {
      const dashboard = await sdk.workspaces.getWorkspaceDashboard(workspace.id);
      console.log('Dashboard Stats:', {
        totalProjects: dashboard.totalProjects,
        totalDatasources: dashboard.totalDatasources,
        totalConversations: dashboard.totalConversations
      });
    } catch (error) {
      console.log('Dashboard data not available');
    }
    console.log();

    console.log('✅ Basic usage example completed successfully!');

  } catch (error) {
    console.error('❌ Error during example execution:', error.message);
    if (error.status) {
      console.error(`HTTP Status: ${error.status}`);
    }
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

// Run the example
if (require.main === module) {
  basicUsageExample().catch(console.error);
}

module.exports = basicUsageExample;