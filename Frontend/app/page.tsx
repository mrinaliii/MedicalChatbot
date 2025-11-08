'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Brain, 
  Eye, 
  Bone, 
  Stethoscope, 
  Activity,
  MessageCircle,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Bot
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  department?: string;
}

const departmentIcons: { [key: string]: any } = {
  'Cardiology': Heart,
  'Dermatology': Activity,
  'Neurology': Brain,
  'General Medicine': Stethoscope,
  'Gastroenterology': Activity,
  'Orthopedics': Bone,
  'Ophthalmology': Eye,
};

const departmentColors: { [key: string]: string } = {
  'Cardiology': 'bg-red-100 text-red-800 border-red-200',
  'Dermatology': 'bg-orange-100 text-orange-800 border-orange-200',
  'Neurology': 'bg-purple-100 text-purple-800 border-purple-200',
  'General Medicine': 'bg-blue-100 text-blue-800 border-blue-200',
  'Gastroenterology': 'bg-green-100 text-green-800 border-green-200',
  'Orthopedics': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Ophthalmology': 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: 'Hello! I\'m your medical assistant. Please describe your symptoms, and I\'ll help you identify which medical department would be best suited to help you.',
        timestamp: new Date(),
      }
    ]);
  }, []);

  const analyzeSymptoms = async (symptoms: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: symptoms
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || response.statusText);
      }

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error('Error:', error);
      return 'I apologize, but I\'m having trouble connecting to the medical analysis service. Please try again later or consult with a healthcare professional directly.';
    }
  };

  const extractDepartment = (response: string): string | undefined => {
    const departments = ['Cardiology', 'Dermatology', 'Neurology', 'General Medicine', 'Gastroenterology', 'Orthopedics', 'Ophthalmology'];
    return departments.find(dept => response.toLowerCase().includes(dept.toLowerCase()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await analyzeSymptoms(inputValue);
      const department = extractDepartment(response);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        department,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error while analyzing your symptoms. Please try again or consult with a healthcare professional.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    if (!isClient) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MedAssist</h1>
              <p className="text-sm text-gray-600">AI-Powered Medical Department Guidance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to MedAssist</CardTitle>
            <CardDescription className="text-blue-100">
              Get personalized recommendations for which medical department to consult based on your symptoms. 
              Our AI assistant will help guide you to the right specialist.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Chat Interface */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Medical Consultation Chat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.department && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-gray-600">Recommended Department:</span>
                          </div>
                          <Badge 
                            className={`mt-1 ${departmentColors[message.department] || 'bg-gray-100 text-gray-800'}`}
                            variant="outline"
                          >
                            {(() => {
                              const IconComponent = departmentIcons[message.department] || Activity;
                              return <IconComponent className="h-3 w-3 mr-1" />;
                            })()}
                            {message.department}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center order-2">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Analyzing your symptoms...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex gap-3">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe your symptoms in detail... (e.g., I have chest pain and breathlessness)"
                  className="flex-1 min-h-[60px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Department Guide */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Medical Departments Guide
            </CardTitle>
            <CardDescription>
              Common symptoms and their corresponding medical departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { dept: 'Cardiology', symptoms: 'Chest pain, breathlessness, heart palpitations', icon: Heart },
                { dept: 'Dermatology', symptoms: 'Rashes, acne, skin conditions', icon: Activity },
                { dept: 'Neurology', symptoms: 'Headaches, dizziness, neurological issues', icon: Brain },
                { dept: 'General Medicine', symptoms: 'Fever, sore throat, general illness', icon: Stethoscope },
                { dept: 'Gastroenterology', symptoms: 'Stomach issues, digestive problems', icon: Activity },
                { dept: 'Orthopedics', symptoms: 'Joint pain, bone issues, muscle problems', icon: Bone },
                { dept: 'Ophthalmology', symptoms: 'Eye problems, vision issues', icon: Eye },
              ].map((item) => (
                <div key={item.dept} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${departmentColors[item.dept]?.replace('text-', 'text-').replace('border-', 'bg-').split(' ')[0]} flex-shrink-0`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.dept}</h3>
                      <p className="text-sm text-gray-600">{item.symptoms}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Medical Disclaimer</h3>
                <p className="text-sm text-orange-800 leading-relaxed">
                  This AI assistant provides general guidance only and should not replace professional medical advice. 
                  Always consult with qualified healthcare professionals for proper diagnosis and treatment. 
                  In case of emergency, contact your local emergency services immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}