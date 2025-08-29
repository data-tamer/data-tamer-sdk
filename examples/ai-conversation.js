const DataTamerSDK = require('@datatamer/data-tamer-sdk').default;

async function aiConversationExample() {
  // Initialize SDK with API token
  const sdk = new DataTamerSDK({
    baseUrl: 'https://app.datatamer.ai/api',
    apiKey: 'your-api-token-here' // Get from account settings
  });

  console.log('🤖 Starting AI Conversation Example\n');

  try {
    // 1. Get workspace and topic for context
    console.log('📊 Setting up workspace and topic context...');
    const workspaces = await sdk.workspaces.listWorkspaces();
    
    if (workspaces.length === 0) {
      console.log('❌ No workspaces found. Please create one first.');
      return;
    }

    const workspace = workspaces[0];
    console.log(`   Using workspace: ${workspace.name}`);

    // Get or create a topic
    let topics = await sdk.topics.listTopics(workspace.id);
    let topic;

    if (topics.length === 0) {
      console.log('   Creating a sample topic for AI conversation...');
      topic = await sdk.topics.createTopic({
        name: 'AI Conversation Demo',
        description: 'Topic created for AI conversation example',
        organizationId: workspace.id
      });
      console.log(`   ✅ Created topic: ${topic.name}`);
    } else {
      topic = topics[0];
      console.log(`   Using existing topic: ${topic.name}`);
    }
    console.log();

    // 2. Start a new conversation
    console.log('💬 Starting a new AI conversation...');
    const { conversation, response: firstResponse } = await sdk.conversations.startConversation(
      workspace.id,
      topic.id,
      'Hello! I need help analyzing customer data. Can you guide me through the process?',
      'Customer Data Analysis Guidance'
    );

    console.log(`   ✅ Started conversation: ${conversation.title}`);
    console.log(`   Conversation ID: ${conversation.id}`);
    console.log();
    
    console.log('🤖 AI Response:');
    console.log(`   ${firstResponse.content}`);
    console.log();

    // 3. Continue the conversation with follow-up questions
    const followUpQuestions = [
      'What are the most important metrics to track for customer analysis?',
      'How can I identify at-risk customers who might churn?',
      'What visualization techniques work best for customer segmentation?'
    ];

    for (let i = 0; i < followUpQuestions.length; i++) {
      console.log(`📝 Follow-up question ${i + 1}: ${followUpQuestions[i]}`);
      
      const followUpResponse = await sdk.conversations.continueConversation(
        conversation.id,
        followUpQuestions[i]
      );

      console.log('🤖 AI Response:');
      console.log(`   ${followUpResponse.content.substring(0, 200)}${followUpResponse.content.length > 200 ? '...' : ''}`);
      console.log();
    }

    // 4. Get conversation history
    console.log('📚 Retrieving conversation history...');
    const conversationHistory = await sdk.conversations.getHistory(workspace.id, topic.id);
    console.log(`   Found ${conversationHistory.length} conversations in this topic`);
    
    // Find our conversation
    const ourConversation = conversationHistory.find(c => c.id === conversation.id);
    if (ourConversation) {
      console.log(`   Our conversation: "${ourConversation.title}"`);
      console.log(`   Status: ${ourConversation.status}`);
      console.log(`   Created: ${new Date(ourConversation.createdAt).toLocaleString()}`);
    }
    console.log();

    // 5. Get full conversation with all messages
    console.log('💭 Getting full conversation details...');
    const fullConversation = await sdk.conversations.getFullConversation(conversation.id);
    console.log(`   Conversation has ${fullConversation.messages?.length || 0} messages`);
    
    if (fullConversation.messages && fullConversation.messages.length > 0) {
      console.log('   Message summary:');
      fullConversation.messages.forEach((message, index) => {
        const role = message.role === 'user' ? '👤' : '🤖';
        const preview = message.content.substring(0, 50);
        console.log(`     ${index + 1}. ${role} ${preview}${message.content.length > 50 ? '...' : ''}`);
      });
    }
    console.log();

    // 6. Demonstrate topic-based chat (direct chat without conversation history)
    console.log('🎯 Demonstrating direct topic chat...');
    const directChatResponse = await sdk.topics.chatInTopic(
      topic.id,
      'What are the best practices for data preprocessing?',
      { 
        context: 'data_analysis',
        includeHistory: false // Don't include previous conversation context
      }
    );

    console.log('🤖 Direct chat response:');
    console.log(`   ${directChatResponse.content.substring(0, 300)}${directChatResponse.content.length > 300 ? '...' : ''}`);
    console.log();

    // 7. Get conversation statistics
    console.log('📊 Getting conversation statistics...');
    try {
      const conversationStats = await sdk.conversations.getStats(workspace.id, topic.id);
      console.log('   Conversation Statistics:');
      console.log(`     Total conversations: ${conversationStats.totalConversations}`);
      console.log(`     Total messages: ${conversationStats.totalMessages}`);
      console.log(`     Average messages per conversation: ${conversationStats.averageMessagesPerConversation}`);
      console.log(`     Most active day: ${conversationStats.mostActiveDay}`);
    } catch (error) {
      console.log('   Statistics not available');
    }
    console.log();

    // 8. Demonstrate conversation management
    console.log('⚙️ Demonstrating conversation management...');
    
    // Update conversation title
    const newTitle = `Updated: Customer Analysis - ${new Date().toLocaleDateString()}`;
    await sdk.conversations.editTitle(conversation.id, newTitle);
    console.log(`   ✅ Updated conversation title to: ${newTitle}`);

    // Verify the update
    const updatedConversation = await sdk.conversations.getFullConversation(conversation.id);
    console.log(`   Verified title: ${updatedConversation.title}`);
    console.log();

    // 9. Demonstrate real-time AI responses
    console.log('⚡ Demonstrating streaming AI response...');
    console.log('   Note: This example shows how to handle streaming responses');
    console.log('   In a real application, you would display tokens as they arrive');
    
    // Set up real-time listener for AI responses
    let responseTokens = [];
    const unsubscribeAI = sdk.realtime.onAIResponses((response) => {
      if (response.conversationId === conversation.id) {
        responseTokens.push(response.content);
        
        if (response.isComplete) {
          console.log(`   ✅ Streaming response completed: ${responseTokens.join('')}`);
          responseTokens = []; // Reset for next response
        }
      }
    });

    // Connect to real-time stream briefly
    try {
      await sdk.realtime.connect({
        reconnect: false,
        maxReconnectAttempts: 1
      }, {
        onOpen: () => console.log('   🔌 Connected to real-time stream'),
        onError: (error) => console.log(`   ⚠️ Real-time error: ${error.message}`)
      });

      // Send a message that might trigger streaming
      await sdk.conversations.continueConversation(
        conversation.id,
        'Can you provide a quick summary of our discussion so far?'
      );

      // Wait a moment for potential streaming response
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Cleanup
      unsubscribeAI();
      sdk.realtime.disconnect();
      
    } catch (error) {
      console.log(`   ⚠️ Real-time streaming not available: ${error.message}`);
    }
    console.log();

    // 10. Best practices summary
    console.log('💡 AI Conversation Best Practices:\n');
    console.log('   🎯 Context Management:');
    console.log('     - Use descriptive conversation titles');
    console.log('     - Organize conversations by topic');
    console.log('     - Include relevant context in messages');
    console.log();
    console.log('   💬 Message Crafting:');
    console.log('     - Be specific and clear in your questions');
    console.log('     - Provide context about your data and goals');
    console.log('     - Ask follow-up questions to dive deeper');
    console.log();
    console.log('   🔄 Conversation Flow:');
    console.log('     - Start with broad questions, then get specific');
    console.log('     - Reference previous messages when relevant');
    console.log('     - Update conversation titles as topics evolve');
    console.log();
    console.log('   ⚡ Performance:');
    console.log('     - Use streaming for real-time feedback');
    console.log('     - Consider conversation length for context');
    console.log('     - Archive completed conversations');
    console.log();

    console.log('✅ AI Conversation example completed successfully!');
    console.log('\n🎉 Summary of what we accomplished:');
    console.log('   - Started a new AI conversation');
    console.log('   - Asked follow-up questions');
    console.log('   - Retrieved conversation history');
    console.log('   - Demonstrated direct topic chat');
    console.log('   - Updated conversation title');
    console.log('   - Showed real-time streaming concepts');

  } catch (error) {
    console.error('❌ Error during AI conversation example:', error.message);
    if (error.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }
    if (error.details) {
      console.error('   Details:', error.details);
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure you have a valid workspace and topic');
    console.log('   2. Check that AI features are enabled for your account');
    console.log('   3. Verify your API token has conversation permissions');
    console.log('   4. Make sure you have sufficient credits/quota');
  }
}

// Show usage information
function showUsage() {
  console.log(`
AI Conversation Example Usage:

1. Get an API token from your DataTamer account settings
2. Update the apiKey in the code with your token
3. Run: node ai-conversation.js

This example demonstrates:
- 💬 Starting AI conversations
- 🔄 Continuing conversations with follow-ups
- 📚 Retrieving conversation history
- 💭 Getting full conversation details
- 🎯 Direct topic-based chat
- ⚙️ Managing conversation titles
- ⚡ Real-time streaming responses
- 💡 Best practices for AI interactions

Prerequisites:
- At least one workspace in your account
- AI features enabled for your account
- Valid API token with conversation permissions

The example will:
1. Use an existing workspace or help you create one
2. Create or use an existing topic
3. Demonstrate various AI conversation patterns
4. Show best practices for effective AI interactions
`);
}

// Run the example
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
  } else {
    aiConversationExample().catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
  }
}

module.exports = aiConversationExample;