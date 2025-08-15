import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, MessageSquare, Target, Users, HelpCircle } from 'lucide-react';

const Campaigns = () => {
  const campaigns = [
    {
      id: 'general',
      name: 'General Assistant',
      description: 'Multi-purpose AI helper for general questions',
      icon: HelpCircle,
      category: 'general',
      isActive: true
    },
    {
      id: 'customer-support',
      name: 'Customer Support',
      description: 'Helpful support agent for customer queries',
      icon: MessageSquare,
      category: 'customer-support',
      isActive: true
    },
    {
      id: 'sales',
      name: 'Outbound Sales',
      description: 'Proactive sales outreach and lead qualification',
      icon: Target,
      category: 'outbound-sales',
      isActive: false
    },
    {
      id: 'lead-gen',
      name: 'Lead Generation',
      description: 'Lead qualification and nurturing',
      icon: Users,
      category: 'lead-generation',
      isActive: true
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Campaigns</h1>
          <p className="text-dark-300">Manage your AI chatbot campaigns and prompts</p>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-xl hover:shadow-neon transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Campaign</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-800/50 border border-dark-600 rounded-xl p-6 hover:border-neon-blue/30 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                <campaign.icon className="w-6 h-6 text-white" />
              </div>
              <button className="p-2 text-dark-400 hover:text-white transition-colors duration-200">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{campaign.name}</h3>
            <p className="text-dark-400 mb-4">{campaign.description}</p>
            
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                campaign.isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {campaign.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-dark-400 capitalize">{campaign.category}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
