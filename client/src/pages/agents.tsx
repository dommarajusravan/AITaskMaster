import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Agent, AgentType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  MessageSquare, 
  Mail, 
  Brush, 
  Search, 
  Settings, 
  Edit, 
  Trash, 
  PlayCircle, 
  PauseCircle 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const AgentDashboard: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  // This will be replaced with actual API data
  const mockAgents: Agent[] = [
    {
      id: 1,
      userId: 1,
      name: "General Assistant",
      type: "chat",
      description: "A general-purpose assistant that can answer questions on a wide range of topics.",
      systemPrompt: "You are a helpful assistant that provides clear and concise information on any topic the user asks about.",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      userId: 1,
      name: "Email Summarizer",
      type: "email",
      description: "Analyze and summarize emails to extract key information and action items.",
      systemPrompt: "You are an email processing assistant. Analyze the provided emails, extract key information, and identify action items.",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      userId: 1,
      name: "Creative Writer",
      type: "creative",
      description: "Generate creative content like stories, poems, and marketing copy.",
      systemPrompt: "You are a creative writing assistant with a flair for engaging storytelling and compelling copy.",
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // This will be replaced with an actual API query
  const { data: agents = mockAgents, isLoading } = useQuery({
    queryKey: ['/api/agents'],
    enabled: isAuthenticated,
    initialData: mockAgents
  });

  const getAgentTypeIcon = (type: AgentType) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-5 w-5 mr-2" />;
      case 'email':
        return <Mail className="h-5 w-5 mr-2" />;
      case 'creative':
        return <Brush className="h-5 w-5 mr-2" />;
      case 'research':
        return <Search className="h-5 w-5 mr-2" />;
      case 'custom':
      default:
        return <Settings className="h-5 w-5 mr-2" />;
    }
  };

  const getAgentTypeName = (type: AgentType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        Please log in to access the agent dashboard
      </div>
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin mb-2 mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p>Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Agents</h1>
        <Button onClick={() => setIsCreatingAgent(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Create New Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className={`overflow-hidden transition-all ${!agent.isActive ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">
                    <div className="flex items-center">
                      {getAgentTypeIcon(agent.type as AgentType)}
                      {getAgentTypeName(agent.type as AgentType)}
                    </div>
                  </Badge>
                  <CardTitle>{agent.name}</CardTitle>
                </div>
                <div>
                  {agent.isActive ? (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
              </div>
              <CardDescription className="line-clamp-2 mt-1">
                {agent.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm h-24 overflow-auto mb-2">
                <p className="text-muted-foreground">{agent.systemPrompt}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Created: {new Date(agent.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
              <Button 
                variant={agent.isActive ? "default" : "secondary"} 
                size="sm"
              >
                {agent.isActive ? (
                  <><PauseCircle className="h-4 w-4 mr-1" /> Pause</>
                ) : (
                  <><PlayCircle className="h-4 w-4 mr-1" /> Activate</>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentDashboard;