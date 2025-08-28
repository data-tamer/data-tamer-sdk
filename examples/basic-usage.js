const DataTamerSDK = require('data-tamer-sdk').default;

async function basicUsageExample() {
  // Initialize SDK
  const sdk = new DataTamerSDK({
    baseUrl: 'http://localhost:3000',
    sessionToken: 'your-session-token-here'
  });

  try {
    console.log('🚀 Starting Data Tamer SDK Basic Usage Example\n');

    // 1. Health Check
    console.log('📊 Checking SDK health...');
    const health = await sdk.healthCheck();
    console.log('Health status:', health.status);
    console.log('Services:', health.services);
    console.log();

    // 2. List Organizations
    console.log('🏢 Fetching organizations...');
    const organizations = await sdk.organizations.list();
    console.log(`Found ${organizations.length} organizations`);
    
    if (organizations.length === 0) {
      console.log('No organizations found. Creating one...');
      const newOrg = await sdk.organizations.create({
        name: 'Example Organization',
        description: 'Created by SDK example'
      });
      organizations.push(newOrg.organization);
    }

    const org = organizations[0];
    console.log(`Using organization: ${org.name} (${org.id})`);
    console.log();

    // 3. List Projects
    console.log('📁 Fetching projects...');
    const projects = await sdk.projects.list(org.id);
    console.log(`Found ${projects.length} projects in organization`);

    // Create a project if none exist
    let project;
    if (projects.length === 0) {
      console.log('Creating a sample project...');
      project = await sdk.projects.create({
        name: 'SDK Example Project',
        description: 'A project created by the SDK example',
        organizationId: org.id
      });
      console.log(`Created project: ${project.name} (${project.id})`);
    } else {
      project = projects[0];
      console.log(`Using existing project: ${project.name} (${project.id})`);
    }
    console.log();

    // 4. List Datasources
    console.log('🗄️ Fetching datasources...');
    const datasources = await sdk.datasources.list(org.id);
    console.log(`Found ${datasources.length} datasources`);

    // Create a sample datasource
    if (datasources.length === 0) {
      console.log('Creating a sample CSV datasource...');
      const datasource = await sdk.datasources.create({
        name: 'Sample CSV Data',
        description: 'Example CSV datasource',
        organizationId: org.id,
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
    const tamedDataList = await sdk.tamedData.getByProject(project.id);
    console.log(`Found ${tamedDataList.length} tamed data entries`);

    // Create tamed data if none exist and we have datasources
    if (tamedDataList.length === 0 && datasources.length > 0) {
      console.log('Creating sample tamed data...');
      const tamedData = await sdk.tamedData.create({
        name: 'Processed Sample Data',
        description: 'Tamed data created by SDK example',
        projectId: project.id,
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
    const conversations = await sdk.conversations.getHistory(org.id, project.id);
    console.log(`Found ${conversations.length} conversations`);

    // Start a conversation if none exist
    if (conversations.length === 0) {
      console.log('Starting a new AI conversation...');
      const { conversation, response } = await sdk.conversations.startConversation(
        org.id,
        project.id,
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
      const billingHistory = await sdk.billing.getHistory(org.id);
      console.log(`Found ${billingHistory.length} billing entries`);
      
      const subscriptionStatus = await sdk.billing.getSubscriptionStatus();
      console.log(`Subscription status: ${subscriptionStatus.status}`);
      console.log(`Has active subscription: ${subscriptionStatus.hasActiveSubscription}`);
    } catch (error) {
      console.log('Billing information not available (might not be set up)');
    }
    console.log();

    // 8. Project Statistics
    console.log('📈 Getting project statistics...');
    const projectStats = await sdk.projects.getStats(project.id);
    console.log('Project Stats:', {
      totalUsers: projectStats.totalUsers,
      totalActions: projectStats.totalActions,
      totalTamedData: projectStats.totalTamedData,
      lastActivity: projectStats.lastActivity
    });
    console.log();

    // 9. Organization Dashboard
    console.log('📊 Getting organization dashboard...');
    try {
      const dashboard = await sdk.organizations.getDashboard(org.id);
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