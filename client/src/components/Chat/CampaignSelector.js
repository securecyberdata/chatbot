import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, Settings, MessageSquare, Target, HelpCircle } from 'lucide-react';

const CampaignSelector = ({ selectedCampaign, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const campaigns = [
    {
      id: 'general',
      name: 'General Assistant',
      description: 'Multi-purpose AI helper for general questions',
      icon: HelpCircle,
      category: 'general'
    },
    {
      id: 'customer-support',
      name: 'Customer Support',
      description: 'Helpful support agent for customer queries',
      icon: MessageSquare,
      category: 'customer-support'
    },
    {
      id: 'sales',
      name: 'Outbound Sales',
      description: 'Proactive sales outreach and lead qualification',
      icon: Target,
      category: 'outbound-sales'
    },
    {
      id: 'lead-gen',
      name: 'Lead Generation',
      description: 'Lead qualification and nurturing',
      icon: Users,
      category: 'lead-generation'
    },
    {
      id: 'technical',
      name: 'Technical Support',
      description: 'Technical problem solving and troubleshooting',
      icon: Settings,
      category: 'technical-support'
    }
  ];

  const getCampaignIcon = (category) => {
    const campaign = campaigns.find(c => c.category === category);
    return campaign ? campaign.icon : HelpCircle;
  };

  const IconComponent = selectedCampaign ? getCampaignIcon(selectedCampaign.category) : HelpCircle;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white hover:border-neon-blue transition-all duration-200"
      >
        <IconComponent className="w-4 h-4 text-neon-blue" />
        <span className="text-sm font-medium">
          {selectedCampaign?.name || 'Select Campaign'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl z-50"
          >
            <div className="p-2 space-y-1">
              {campaigns.map((campaign) => (
                <motion.button
                  key={campaign.id}
                  whileHover={{ backgroundColor: 'rgba(0, 212, 255, 0.1)' }}
                  onClick={() => {
                    onSelect(campaign);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedCampaign?.id === campaign.id
                      ? 'bg-neon-blue/20 border border-neon-blue/30'
                      : 'hover:bg-dark-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedCampaign?.id === campaign.id
                      ? 'bg-neon-blue text-white'
                      : 'bg-dark-600 text-dark-300'
                  }`}>
                    <campaign.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${
                      selectedCampaign?.id === campaign.id ? 'text-white' : 'text-white'
                    }`}>
                      {campaign.name}
                    </p>
                    <p className="text-sm text-dark-400 mt-1">
                      {campaign.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignSelector;
