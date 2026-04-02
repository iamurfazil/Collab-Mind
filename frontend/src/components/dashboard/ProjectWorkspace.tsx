import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { 
  ArrowLeft, MessageSquare, CheckSquare, Paperclip, 
  Users, Send, FileText, Download, Plus, MoreVertical,
  Clock, CheckCircle, Circle, UserPlus
} from 'lucide-react';

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, ideas, addNotification } = useStore();
  
  const [activeTab, setActiveTab] = useState<'discussion' | 'tasks' | 'files' | 'team'>('discussion');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Find the specific project
  const project = ideas.find(i => i.id === id);

  // Determine if the current user is the owner of this project
  const isOwner = user && project ? project.userId === user.id : false;

  // --- INTERACTIVE STATE ---
  const [message, setMessage] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const [messages, setMessages] = useState([
    { id: 1, sender: project?.userName || 'Owner', role: 'owner', text: 'Welcome to the workspace everyone! Excited to get started on this.', time: '10:00 AM', isMe: isOwner },
    { id: 2, sender: 'Alex Builder', role: 'solver', text: 'Thanks! I have already started looking into the initial architecture.', time: '10:15 AM', isMe: user?.displayName === 'Alex Builder' },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Set up GitHub Repository', assignee: 'Alex Builder', status: 'completed' },
    { id: 2, title: 'Design Database Schema', assignee: project?.userName || 'Owner', status: 'in-progress' },
    { id: 3, title: 'Create initial API endpoints', assignee: 'Unassigned', status: 'pending' },
  ]);

  const [files, setFiles] = useState([
    { id: 1, name: 'Project_Requirements.pdf', size: '2.4 MB', date: 'Oct 24, 2025', type: 'pdf' },
    { id: 2, name: 'Architecture_Diagram.png', size: '4.1 MB', date: 'Oct 25, 2025', type: 'image' },
  ]);

  const [team, setTeam] = useState([
    { id: project?.userId || '1', name: project?.userName || 'Owner', role: 'Problem Owner', isOwner: true },
    ...(project?.collaborators || []).map((collabId, idx) => ({
      id: collabId,
      name: `Collaborator ${idx + 1}`,
      role: 'Builder',
      isOwner: false
    }))
  ]);

  // Scroll to bottom of chat when new messages appear
  useEffect(() => {
    if (activeTab === 'discussion') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, messages]);

  if (!user || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-6">The workspace you are looking for does not exist.</p>
        <button 
          onClick={() => navigate('/dashboard/current-projects')}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  // --- HANDLERS ---

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      sender: user.displayName,
      role: user.role,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }]);
    setMessage('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fromChat: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFile = {
      id: Date.now(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: file.type.includes('image') ? 'image' : 'document'
    };

    setFiles([...files, newFile]);
    addNotification(`File ${file.name} uploaded successfully!`, 'success');

    // If uploaded from chat, also send a message to the group
    if (fromChat) {
      setMessages([...messages, {
        id: Date.now() + 1,
        sender: user.displayName,
        role: user.role,
        text: `Shared a file: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }]);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    setTasks([...tasks, {
      id: Date.now(),
      title: newTaskTitle,
      assignee: 'Unassigned',
      status: 'pending'
    }]);
    setNewTaskTitle('');
    addNotification('Task added to project!', 'success');
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        if (newStatus === 'completed') addNotification(`Task completed!`, 'success');
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    // Mock adding a member by using their email prefix as a name
    const mockName = newMemberEmail.split('@')[0];
    setTeam([...team, {
      id: String(Date.now()),
      name: mockName.charAt(0).toUpperCase() + mockName.slice(1),
      role: 'Builder',
      isOwner: false
    }]);
    setNewMemberEmail('');
    addNotification(`Invitation sent to ${newMemberEmail}`, 'success');
  };

  const tabs = [
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'files', label: 'Files', icon: Paperclip },
    { id: 'team', label: 'Team', icon: Users },
  ] as const;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-6 lg:-m-8 bg-gray-50">
      
      {/* Workspace Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/current-projects')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600 border border-orange-200 uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          {team.slice(0, 3).map((member) => (
            <div key={member.id} className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm" title={member.name}>
              {member.name.charAt(0)}
            </div>
          ))}
          {team.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold shadow-sm">
              +{team.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 flex gap-6 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 px-2 font-medium text-sm transition-all border-b-2 relative ${
              activeTab === tab.id 
                ? 'border-orange-500 text-orange-500' 
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workspace Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* --- DISCUSSION TAB --- */}
          {activeTab === 'discussion' && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-1">
                        {msg.sender.charAt(0)}
                      </div>
                      <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{msg.isMe ? 'You' : msg.sender}</span>
                          <span className="text-xs text-gray-500">{msg.time}</span>
                        </div>
                        <div className={`px-4 py-3 rounded-2xl ${
                          msg.isMe 
                            ? 'bg-orange-500 text-white rounded-tr-sm' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="bg-white p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  {/* Hidden File Input for Chat */}
                  <input 
                    type="file" 
                    ref={chatFileInputRef} 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, true)} 
                  />
                  <button 
                    type="button" 
                    onClick={() => chatFileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-orange-50"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl outline-none transition-all text-gray-900"
                  />
                  <button 
                    type="submit"
                    disabled={!message.trim()}
                    className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* --- TASKS TAB --- */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 p-6 overflow-y-auto"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg font-bold text-gray-900">Project Tasks</h2>
                </div>

                {/* Only Owner can add tasks */}
                {isOwner && (
                  <form onSubmit={handleAddTask} className="mb-6 flex gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <input 
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-900"
                    />
                    <button 
                      type="submit"
                      disabled={!newTaskTitle.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Task
                    </button>
                  </form>
                )}
                
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-orange-300 transition-colors">
                      <div className="flex items-center gap-4">
                        {/* Builders and Owners can toggle tasks */}
                        <button 
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`${task.status === 'completed' ? 'text-green-500' : 'text-gray-300 hover:text-orange-500'} transition-colors cursor-hover`}
                        >
                          {task.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </button>
                        <div>
                          <p className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">Assignee: {task.assignee}</p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-gray-100">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* --- FILES TAB --- */}
          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 p-6 overflow-y-auto"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Project Files</h2>
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, false)} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-medium transition-colors cursor-hover"
                  >
                    <Plus className="w-4 h-4" /> Upload File
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {files.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-500">No files uploaded yet.</p>
                    </div>
                  ) : (
                    files.map((file) => (
                      <div key={file.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-medium text-gray-900 truncate mb-1" title={file.name}>{file.name}</h3>
                        <p className="text-xs text-gray-500 mb-4">{file.size} • {file.date}</p>
                        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 cursor-hover">
                          <Download className="w-4 h-4" /> Download
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* --- TEAM TAB --- */}
          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 p-6 overflow-y-auto"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
                </div>

                {/* Only Owner can invite new collaborators */}
                {isOwner && (
                  <form onSubmit={handleAddTeamMember} className="mb-6 flex gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <input 
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Enter email to invite..."
                      className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-900"
                    />
                    <button 
                      type="submit"
                      disabled={!newMemberEmail.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-50 rounded-lg font-medium transition-colors cursor-hover"
                    >
                      <UserPlus className="w-4 h-4" /> Invite
                    </button>
                  </form>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.map((member) => (
                    <div key={member.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      {member.isOwner && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold uppercase rounded-md tracking-wider">
                          Owner
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}