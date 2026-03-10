'use client';

import { useState } from 'react';
import { usePeerStore } from '@/store/usePeerStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, Users, File, Send, Plus, Settings, LogOut, Copy, Menu, X, Globe } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

const dict = {
  en: {
    appTitle: 'Share AboElnazer',
    usernameLabel: 'Username',
    roomCodeLabel: 'Room Code (4 Chars)',
    joinRoom: 'Join Room',
    or: 'or',
    createNewRoom: 'Create New Room',
    localNetworkRooms: 'Local Network Rooms',
    join: 'Join',
    nexusRoom: 'Share AboElnazer Room',
    textChannels: 'Text Channels',
    roomCode: 'Room Code',
    connectedPeers: 'Connected Peers',
    waitingForOthers: 'Waiting for others...',
    localNetwork: 'Local Network',
    notInRoom: 'Not in a room',
    transfers: 'Transfers',
    sending: 'Sending',
    receiving: 'Receiving',
    noActiveTransfers: 'No active transfers',
    online: 'Online',
    userSettings: 'User Settings',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    welcomeTo: 'Welcome to',
    startOfChannel: 'This is the start of the',
    channelInRoom: 'channel in room',
    message: 'Message',
    createChannel: 'Create Channel',
    channelName: 'Channel Name',
    create: 'Create',
  },
  ar: {
    appTitle: 'Share AboElnazer',
    usernameLabel: 'اسم المستخدم',
    roomCodeLabel: 'رمز الغرفة (٤ أحرف)',
    joinRoom: 'انضمام للغرفة',
    or: 'أو',
    createNewRoom: 'إنشاء غرفة جديدة',
    localNetworkRooms: 'غرف الشبكة المحلية',
    join: 'انضمام',
    nexusRoom: 'غرفة Share AboElnazer',
    textChannels: 'القنوات النصية',
    roomCode: 'رمز الغرفة',
    connectedPeers: 'الأقران المتصلين',
    waitingForOthers: 'في انتظار الآخرين...',
    localNetwork: 'الشبكة المحلية',
    notInRoom: 'ليس في غرفة',
    transfers: 'التحويلات',
    sending: 'إرسال',
    receiving: 'استقبال',
    noActiveTransfers: 'لا توجد تحويلات نشطة',
    online: 'متصل',
    userSettings: 'إعدادات المستخدم',
    cancel: 'إلغاء',
    saveChanges: 'حفظ التغييرات',
    welcomeTo: 'مرحباً بك في',
    startOfChannel: 'هذه بداية قناة',
    channelInRoom: 'في غرفة',
    message: 'رسالة',
    createChannel: 'إنشاء قناة',
    channelName: 'اسم القناة',
    create: 'إنشاء',
  }
};

export default function NexusApp() {
  const { roomId, setRoomId, username, setUsername, sessionId, peers, lanPeers, channels, currentChannel, setCurrentChannel, language, setLanguage } = usePeerStore();
  const t = dict[language];
  const isRtl = language === 'ar';
  
  const [inputRoom, setInputRoom] = useState('');
  const [inputName, setInputName] = useState(username);
  const { messages, sendMessage, sendFile, createChannel } = useWebRTC();
  const [chatInput, setChatInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsName, setSettingsName] = useState(username);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const fileTransfers = useLiveQuery(
    () => db.files.where({ roomId: roomId || '', sessionId }).toArray(),
    [roomId, sessionId]
  ) || [];

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoom.length === 4 && inputName) {
      setUsername(inputName);
      setRoomId(inputRoom.toUpperCase());
    }
  };

  const handleCreate = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setUsername(inputName);
    setRoomId(code);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        sendFile(file);
      });
    }
    // Reset the input so the same files can be selected again if needed
    e.target.value = '';
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsName.trim()) {
      setUsername(settingsName.trim());
      setIsSettingsOpen(false);
    }
  };

  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      createChannel(newChannelName.trim().toLowerCase().replace(/\s+/g, '-'));
      setNewChannelName('');
      setIsCreateChannelOpen(false);
    }
  };

  if (!roomId) {
    const activeLanPeers = lanPeers.filter(p => p.roomId);

    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-200 font-sans p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} text-zinc-400 hover:text-white flex items-center gap-1.5 text-xs font-medium transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full`}
          >
            <Globe size={14} />
            {language === 'en' ? 'العربية' : 'English'}
          </button>
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-8 text-center text-white tracking-tight">{t.appTitle}</h1>
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t.usernameLabel}</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-zinc-950/50 text-white p-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t.roomCodeLabel}</label>
              <input
                type="text"
                value={inputRoom}
                onChange={(e) => setInputRoom(e.target.value.toUpperCase())}
                maxLength={4}
                className="w-full bg-zinc-950/50 text-white p-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all uppercase placeholder:text-zinc-600 tracking-widest"
                placeholder="X7B2"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98]"
            >
              {t.joinRoom}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-sm text-zinc-500">{t.or}</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
            
            <button
              type="button"
              onClick={handleCreate}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3.5 rounded-xl transition-all border border-white/10 active:scale-[0.98]"
            >
              {t.createNewRoom}
            </button>
          </form>

          {activeLanPeers.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center">
                <Users size={14} className="ltr:mr-2 rtl:ml-2" /> {t.localNetworkRooms}
              </h2>
              <ul className="space-y-2">
                {activeLanPeers.map((peer, i) => (
                  <li 
                    key={i}
                    onClick={() => {
                      if (peer.roomId) {
                        setInputRoom(peer.roomId);
                        setUsername(inputName);
                        setRoomId(peer.roomId);
                      }
                    }}
                    className="bg-zinc-950/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold ltr:mr-3 rtl:ml-3 shadow-sm">
                        {peer.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{peer.username}</div>
                        <div className="text-xs text-zinc-400">{t.roomCode}: <span className="font-mono text-indigo-400">{peer.roomId}</span></div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-indigo-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500/10 px-3 py-1.5 rounded-full">
                      {t.join}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-300 font-sans overflow-hidden relative selection:bg-indigo-500/30" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-72 bg-zinc-900 border-x border-white/5 flex flex-col transform transition-transform duration-300 ease-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')} flex-shrink-0 shadow-2xl md:shadow-none`}>
        <div className="h-16 border-b border-white/5 flex items-center px-5 shadow-sm font-bold text-white justify-between bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-xs">N</div>
            <span className="tracking-tight">{t.nexusRoom}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setRoomId(null)} className="text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-md" title="Leave Room">
              <LogOut size={16} />
            </button>
            <button className="md:hidden text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-md" onClick={() => setIsSidebarOpen(false)}>
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center justify-between px-1">
              <span>{t.textChannels}</span>
              <button 
                onClick={() => setIsCreateChannelOpen(true)}
                className="hover:text-white transition-colors"
              >
                <Plus size={14} />
              </button>
            </h2>
            <ul className="space-y-1">
              {channels.map((channel, i) => (
                <li 
                  key={i} 
                  onClick={() => {
                    setCurrentChannel(channel);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all ${currentChannel === channel ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
                >
                  <Hash size={16} className={`ltr:mr-2 rtl:ml-2 ${currentChannel === channel ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <span className="truncate">{channel}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
              <span>{t.roomCode}</span>
            </h2>
            <div className="bg-zinc-950/50 border border-white/5 p-3 rounded-xl flex items-center justify-between group cursor-pointer hover:border-indigo-500/50 transition-colors" onClick={() => navigator.clipboard.writeText(roomId)}>
              <span className="font-mono text-lg tracking-[0.2em] text-white font-medium pl-1">{roomId}</span>
              <div className="bg-white/5 p-1.5 rounded-md group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                <Copy size={14} className="text-zinc-400 group-hover:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1 flex items-center">
              <Users size={12} className="ltr:mr-1.5 rtl:ml-1.5" /> {t.connectedPeers} <span className="bg-white/10 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded-full ltr:ml-2 rtl:mr-2">{peers.length}</span>
            </h2>
            <ul className="space-y-1">
              {peers.map((peer, i) => (
                <li key={i} className="flex items-center px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer text-zinc-400 hover:text-zinc-200 transition-colors">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold ltr:mr-3 rtl:ml-3 flex-shrink-0 shadow-sm text-xs">
                      {peer.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 ltr:right-3 rtl:left-3 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full"></div>
                  </div>
                  <span className="truncate font-medium">{peer}</span>
                </li>
              ))}
              {peers.length === 0 && (
                <li className="text-sm text-zinc-500 italic px-3 py-2 bg-white/5 rounded-lg border border-white/5 border-dashed">{t.waitingForOthers}</li>
              )}
            </ul>
          </div>

          {lanPeers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1 flex items-center">
                <Users size={12} className="ltr:mr-1.5 rtl:ml-1.5" /> {t.localNetwork}
              </h2>
              <ul className="space-y-1">
                {lanPeers.map((peer, i) => (
                  <li key={i} className="flex items-center px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer text-zinc-400 hover:text-zinc-200 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-white font-bold ltr:mr-3 rtl:ml-3 flex-shrink-0 text-xs">
                      {peer.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{peer.username}</div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {peer.roomId ? `${t.roomCode}: ${peer.roomId}` : t.notInRoom}
                      </div>
                    </div>
                    {peer.roomId && peer.roomId !== roomId && (
                      <button 
                        onClick={() => {
                          setRoomId(peer.roomId!);
                          setIsSidebarOpen(false);
                        }}
                        className="opacity-100 md:opacity-0 group-hover:opacity-100 text-[10px] font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white px-2 py-1 rounded-md ltr:ml-2 rtl:mr-2 transition-colors"
                      >
                        {t.join}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1 flex items-center">
              <File size={12} className="ltr:mr-1.5 rtl:ml-1.5" /> {t.transfers}
            </h2>
            <ul className="space-y-2">
              {fileTransfers.map((transfer, i) => (
                <li key={i} className="bg-zinc-950/50 border border-white/5 p-3 rounded-xl text-sm">
                  <div className="flex justify-between items-center text-zinc-300 mb-2">
                    <span className="truncate flex-1 ltr:mr-2 rtl:ml-2 font-medium text-xs" title={transfer.name}>{transfer.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0">{transfer.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${transfer.progress}%` }}></div>
                  </div>
                  <div className="text-[10px] font-medium text-zinc-500 mt-2 flex justify-between uppercase tracking-wider">
                    <span>{transfer.sender === username ? t.sending : t.receiving}</span>
                    <span className={transfer.status === 'completed' ? 'text-emerald-400' : 'text-indigo-400'}>{transfer.status}</span>
                  </div>
                </li>
              ))}
              {fileTransfers.length === 0 && (
                <li className="text-sm text-zinc-500 italic px-3 py-2 bg-white/5 rounded-lg border border-white/5 border-dashed">{t.noActiveTransfers}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="h-16 bg-zinc-950/50 border-t border-white/5 flex items-center px-4 flex-shrink-0 backdrop-blur-md">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold ltr:mr-3 rtl:ml-3 shadow-sm text-sm">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute bottom-0 ltr:right-3 rtl:left-3 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full"></div>
          </div>
          <div className="flex-1 truncate">
            <div className="text-sm font-bold text-white truncate">{username}</div>
            <div className="text-[11px] text-emerald-400 font-medium">{t.online}</div>
          </div>
          <button 
            className="text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors"
            onClick={() => {
              setSettingsName(username);
              setIsSettingsOpen(true);
            }}
            title={t.userSettings}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-white tracking-tight">{t.userSettings}</h2>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleSaveSettings}>
                  <div className="mb-8">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      {t.usernameLabel}
                    </label>
                    <input
                      type="text"
                      value={settingsName}
                      onChange={(e) => setSettingsName(e.target.value)}
                      className="w-full bg-zinc-950/50 text-white p-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      required
                      maxLength={32}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                    >
                      {t.saveChanges}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Channel Modal */}
      <AnimatePresence>
        {isCreateChannelOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-white tracking-tight">{t.createChannel}</h2>
                  <button 
                    onClick={() => setIsCreateChannelOpen(false)}
                    className="text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleCreateChannelSubmit}>
                  <div className="mb-8">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      {t.channelName}
                    </label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="w-full bg-zinc-950/50 text-white p-3.5 pl-10 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="new-channel"
                        required
                        maxLength={32}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsCreateChannelOpen(false)}
                      className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                    >
                      {t.create}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/5 via-zinc-950 to-zinc-950 pointer-events-none"></div>
        
        <div className="h-16 border-b border-white/5 flex items-center px-4 md:px-6 shadow-sm flex-shrink-0 bg-zinc-950/80 backdrop-blur-md z-10">
          <button className="md:hidden ltr:mr-4 rtl:ml-4 text-zinc-400 hover:text-white bg-white/5 p-2 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <Hash size={20} className="text-zinc-500 ltr:mr-2 rtl:ml-2" />
          <span className="font-bold text-white text-lg tracking-tight">{currentChannel}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.sender === username || !msg.sender;
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex group ${isMe ? (isRtl ? 'flex-row-reverse' : 'flex-row-reverse') : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1 shadow-sm text-sm ${isMe ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 ltr:ml-4 rtl:mr-4' : 'bg-gradient-to-br from-indigo-500 to-violet-600 ltr:mr-4 rtl:ml-4'}`}>
                  {msg.sender ? msg.sender.substring(0, 2).toUpperCase() : 'ME'}
                </div>
                <div className={`flex-1 min-w-0 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-baseline ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className={`font-semibold text-white ${isMe ? 'ltr:ml-2 rtl:mr-2' : 'ltr:mr-2 rtl:ml-2'}`}>{msg.sender || 'Me'}</span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {msg.type === 'chat' ? (
                    <div className={`mt-1.5 relative group/msg max-w-[85%] md:max-w-[75%]`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed break-words shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 rounded-tl-sm border border-white/5'}`}>
                        {msg.content}
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 text-zinc-400 hover:text-white transition-all p-1.5 bg-zinc-800 border border-white/10 rounded-lg shadow-lg ${isMe ? 'ltr:-left-10 rtl:-right-10' : 'ltr:-right-10 rtl:-left-10'}`}
                        title="Copy message"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className={`mt-1.5 bg-zinc-800 border border-white/5 rounded-2xl p-3 flex items-center max-w-sm shadow-sm ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                      <div className="w-12 h-12 bg-zinc-900/50 rounded-xl flex items-center justify-center ltr:mr-3 rtl:ml-3 border border-white/5">
                        <File size={24} className={isMe ? 'text-emerald-400' : 'text-indigo-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold hover:underline cursor-pointer truncate ${isMe ? 'text-emerald-400' : 'text-indigo-400'}`} dir="ltr">
                          <a href={msg.url} download={msg.name}>{msg.name}</a>
                        </div>
                        <div className="text-xs text-zinc-500 font-medium mt-0.5" dir="ltr">{(msg.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )})}
          </AnimatePresence>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 px-4 text-center">
              <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                <Hash size={40} className="text-zinc-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{t.welcomeTo} #{currentChannel}!</h3>
              <p className="text-zinc-400 max-w-md leading-relaxed">{t.startOfChannel} <span className="text-white font-medium">#{currentChannel}</span> {t.channelInRoom} <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{roomId}</span>.</p>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 flex-shrink-0 z-10 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-8">
          <form onSubmit={handleSend} className="bg-zinc-900 border border-white/10 rounded-2xl flex items-center px-2 py-2 shadow-lg focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <label className="cursor-pointer text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-colors ltr:mr-2 rtl:ml-2">
              <Plus size={20} />
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`${t.message} #${currentChannel}`}
              className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-500 text-[15px] px-2"
            />
            <button 
              type="submit" 
              className={`p-2.5 rounded-xl transition-all ltr:ml-2 rtl:mr-2 ${chatInput.trim() ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500' : 'bg-white/5 text-zinc-500'}`} 
              disabled={!chatInput.trim()}
            >
              <Send size={20} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
