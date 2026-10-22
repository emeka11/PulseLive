import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Poll, Option, Vote, Question } from './types';
import {
  BarChart3, PlusCircle, QrCode, Play, Square, RefreshCw,
  ThumbsUp, ArrowLeft, MessageSquare, CheckCircle2, Copy, ExternalLink, Trash2
} from 'lucide-react';

// --- Reusable Multiple Choice Results Bar Chart ---
function MultipleChoiceResults({ options, votes, isLarge = false }: { options: Option[], votes: Vote[], isLarge?: boolean }) {
  const totalVotes = votes.length;
  const optionStats = options.map(opt => {
    const count = votes.filter(v => v.option_id === opt.id).length;
    const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return { ...opt, count, percent };
  }).sort((a, b) => b.count - a.count);

  const BAR_STYLES = [
    { fill: 'bg-indigo-500', text: 'text-indigo-400' },
    { fill: 'bg-emerald-500', text: 'text-emerald-400' },
    { fill: 'bg-amber-500', text: 'text-amber-400' },
    { fill: 'bg-rose-500', text: 'text-rose-400' },
    { fill: 'bg-cyan-500', text: 'text-cyan-400' },
    { fill: 'bg-purple-500', text: 'text-purple-400' },
    { fill: 'bg-violet-500', text: 'text-violet-400' },
    { fill: 'bg-teal-500', text: 'text-teal-400' },
  ];

  return (
    <div className="space-y-6">
      {totalVotes === 0 ? (
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-12 text-center">
          <BarChart3 className={`${isLarge ? 'w-16 h-16' : 'w-12 h-12'} text-slate-500 mx-auto mb-4 animate-pulse`} />
          <p className={`text-slate-400 font-medium ${isLarge ? 'text-2xl' : 'text-base'}`}>
            No votes yet - waiting for the room to respond...
          </p>
        </div>
      ) : (
        <div className={isLarge ? 'space-y-6' : 'space-y-4'}>
          {optionStats.map((opt, idx) => {
            const style = BAR_STYLES[idx % BAR_STYLES.length];
            return (
              <div
                key={opt.id}
                className={`bg-slate-900/80 border border-slate-700/70 rounded-2xl ${isLarge ? 'p-6' : 'p-4'} relative overflow-hidden shadow-lg`}
              >
                <div
                  className={`absolute top-0 left-0 bottom-0 ${style.fill}/25 transition-all duration-700 ease-out`}
                  style={{ width: `${opt.percent}%` }}
                />
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold rounded-lg px-2.5 py-1 bg-slate-800 border border-slate-700 ${isLarge ? 'text-base' : 'text-xs'} text-slate-300`}>
                      #{idx + 1}
                    </span>
                    <span className={`font-bold text-slate-100 ${isLarge ? 'text-2xl' : 'text-base'}`}>
                      {opt.option_text}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`font-extrabold ${style.text} ${isLarge ? 'text-3xl' : 'text-lg'}`}>
                      {opt.count} {opt.count === 1 ? 'vote' : 'votes'}
                    </span>
                    <span className={`font-bold text-slate-400 w-16 text-right ${isLarge ? 'text-2xl' : 'text-sm'}`}>
                      {opt.percent}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Navbar / Header ---
function Navbar() {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-400">
          <BarChart3 className="w-6 h-6" />
          <span>PulseLive</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition text-sm">
            <PlusCircle className="w-4 h-4" /> Create Poll
          </Link>
        </div>
      </div>
    </header>
  );
}

// --- Presenter Dashboard (Home) ---
function Dashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolls();
  }, []);

  async function fetchPolls() {
    setLoading(true);
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPolls(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'draft' | 'live' | 'closed') {
    await supabase.from('polls').update({ status }).eq('id', id);
    fetchPolls();
  }

  async function deletePoll(id: string) {
    if (!confirm('Are you sure you want to delete this poll?')) return;
    await supabase.from('polls').delete().eq('id', id);
    fetchPolls();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Presenter Dashboard - Emeka</h1>
          <p className="text-slate-400 mt-1">Manage your live polls and Q&A sessions.</p>
        </div>
        <button onClick={() => navigate('/create')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
          <PlusCircle className="w-5 h-5" /> New Poll
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading polls...</div>
      ) : polls.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300">No polls yet</h3>
          <p className="text-slate-500 mt-1 mb-6">Create your first poll or Q&A session to get started.</p>
          <button onClick={() => navigate('/create')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition inline-flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Create Poll
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    poll.status === 'live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    poll.status === 'closed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {poll.status}
                  </span>
                  <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">{poll.type}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-1 line-clamp-1">{poll.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{poll.question}</p>
              </div>

              <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {poll.status === 'draft' && (
                    <button onClick={() => updateStatus(poll.id, 'live')} title="Start Poll" className="p-2 hover:bg-slate-700 rounded-lg text-emerald-400 transition">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {poll.status === 'live' && (
                    <button onClick={() => updateStatus(poll.id, 'closed')} title="Close Poll" className="p-2 hover:bg-slate-700 rounded-lg text-rose-400 transition">
                      <Square className="w-4 h-4" />
                    </button>
                  )}
                  {poll.status === 'closed' && (
                    <button onClick={() => updateStatus(poll.id, 'live')} title="Re-open Poll" className="p-2 hover:bg-slate-700 rounded-lg text-amber-400 transition">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deletePoll(poll.id)} title="Delete Poll" className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/poll/${poll.id}/present`} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 transition">
                    Present
                  </Link>
                  <Link to={`/poll/${poll.id}`} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium text-white transition">
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Create Poll View ---
function CreatePoll() {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<'choice' | 'qa'>('choice');
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const addOptionField = () => setOptions([...options, `Option ${options.length + 1}`]);
  const updateOptionText = (index: number, val: string) => {
    const newOpts = [...options];
    newOpts[index] = val;
    setOptions(newOpts);
  };
  const removeOptionField = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) return;
    setSubmitting(true);

    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert([{ title, question, type, status: 'draft' }])
      .select()
      .single();

    if (pollError || !pollData) {
      alert('Error creating poll: ' + (pollError?.message || 'Unknown error'));
      setSubmitting(false);
      return;
    }

    if (type === 'choice') {
      const optionInserts = options.map((optText, idx) => ({
        poll_id: pollData.id,
        option_text: optText,
        display_order: idx + 1,
      }));
      await supabase.from('options').insert(optionInserts);
    }

    setSubmitting(false);
    navigate(`/poll/${pollData.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-6">Create New Session</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Session Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q3 All-Hands Feedback"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Poll / Question Prompt</label>
            <textarea
              required
              rows={3}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. What is our top priority for the upcoming quarter?"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Session Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('choice')}
                className={`py-3 px-4 rounded-xl border font-medium text-sm transition flex items-center justify-center gap-2 ${
                  type === 'choice' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => setType('qa')}
                className={`py-3 px-4 rounded-xl border font-medium text-sm transition flex items-center justify-center gap-2 ${
                  type === 'qa' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Q&A Session
              </button>
            </div>
          </div>

          {type === 'choice' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Poll Options</label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={e => updateOptionText(idx, e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOptionField(idx)} className="p-2.5 text-slate-500 hover:text-rose-400 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOptionField} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 mt-1">
                <PlusCircle className="w-4 h-4" /> Add Option
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
            <Link to="/" className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-700 text-slate-300 font-medium text-sm transition">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Poll Management View ---
function PollManagement() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [copied, setCopied] = useState(false);

  const voteUrl = `${window.location.origin}/vote/${id}`;

  useEffect(() => {
    if (!id) return;
    fetchData();

    // Setup realtime subscriptions
    const channel = supabase.channel(`public:poll_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `poll_id=eq.${id}` }, () => {
        fetchVotes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions', filter: `poll_id=eq.${id}` }, () => {
        fetchQuestions();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls', filter: `id=eq.${id}` }, (payload) => {
        if (payload.new) setPoll(payload.new as Poll);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function fetchData() {
    const [pollRes, optRes, voteRes, qRes] = await Promise.all([
      supabase.from('polls').select('*').eq('id', id).single(),
      supabase.from('options').select('*').eq('poll_id', id).order('display_order'),
      supabase.from('votes').select('*').eq('poll_id', id),
      supabase.from('questions').select('*').eq('poll_id', id).order('upvotes', { ascending: false })
    ]);

    if (pollRes.data) setPoll(pollRes.data);
    if (optRes.data) setOptions(optRes.data);
    if (voteRes.data) setVotes(voteRes.data);
    if (qRes.data) setQuestions(qRes.data);
  }

  async function fetchVotes() {
    const { data } = await supabase.from('votes').select('*').eq('poll_id', id);
    if (data) setVotes(data);
  }

  async function fetchQuestions() {
    const { data } = await supabase.from('questions').select('*').eq('poll_id', id).order('upvotes', { ascending: false });
    if (data) setQuestions(data);
  }

  async function updateStatus(status: 'draft' | 'live' | 'closed') {
    await supabase.from('polls').update({ status }).eq('id', id);
    if (poll) setPoll({ ...poll, status });
  }

  async function resetResults() {
    if (!confirm('Are you sure you want to reset all responses?')) return;
    if (poll?.type === 'choice') {
      await supabase.from('votes').delete().eq('poll_id', id);
      setVotes([]);
    } else {
      await supabase.from('questions').delete().eq('poll_id', id);
      setQuestions([]);
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(voteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!poll) return <div className="text-center py-12 text-slate-500">Loading poll...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition text-sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{poll.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              poll.status === 'live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              poll.status === 'closed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {poll.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {poll.status === 'draft' && (
            <button onClick={() => updateStatus('live')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition text-sm">
              <Play className="w-4 h-4" /> Start Poll
            </button>
          )}
          {poll.status === 'live' && (
            <button onClick={() => updateStatus('closed')} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition text-sm">
              <Square className="w-4 h-4" /> Close Poll
            </button>
          )}
          {poll.status === 'closed' && (
            <button onClick={() => updateStatus('live')} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition text-sm">
              <RefreshCw className="w-4 h-4" /> Re-open
            </button>
          )}
          <Link to={`/poll/${id}/present`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition text-sm">
            <ExternalLink className="w-4 h-4" /> Presenter View
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: QR Code & Join Link */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Audience Participation</h3>
            <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-inner">
              {/* QR Code image generated via public API */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(voteUrl)}`}
                alt="QR Code to Vote"
                className="w-40 h-40 mx-auto"
              />
            </div>
            <p className="text-sm text-slate-400 mb-4">Scan QR code to vote instantly</p>

            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
              <input type="text" readOnly value={voteUrl} className="bg-transparent text-xs text-slate-300 px-2 flex-1 outline-none truncate" />
              <button onClick={copyLink} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition text-xs font-medium flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{poll.question}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {poll.type === 'choice' ? `${votes.length} total votes` : `${questions.length} questions submitted`}
                </p>
              </div>
              <button onClick={resetResults} className="text-xs text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Reset Results
              </button>
            </div>

            {poll.type === 'choice' ? (
              <div className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 flex items-center justify-between shadow-inner">
                  <span className="text-slate-300 font-medium text-sm">Total Participation</span>
                  <span className="text-2xl font-extrabold text-indigo-400">{votes.length} {votes.length === 1 ? 'vote' : 'votes'}</span>
                </div>
                <MultipleChoiceResults options={options} votes={votes} />
              </div>
            ) : (
              <div className="space-y-3">
                {questions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No questions submitted yet.</p>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                      <p className="text-slate-200 font-medium">{q.question_text}</p>
                      <div className="flex items-center gap-1.5 bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/30 text-sm font-bold">
                        <ThumbsUp className="w-4 h-4" /> {q.upvotes}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Stats Summary Card ---
function StatsSummary({ totalVotes }: { totalVotes: number }) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-slate-300 font-medium">Total Votes</span>
        </div>
        <span className="text-3xl font-bold text-indigo-400">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
      </div>
    </div>
  );
}

// --- Presenter Projector View ---
function PresenterView() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const voteUrl = `${window.location.origin}/vote/${id}`;

  useEffect(() => {
    if (!id) return;
    fetchData();

    const channel = supabase.channel(`public:presenter_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `poll_id=eq.${id}` }, () => fetchVotes())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions', filter: `poll_id=eq.${id}` }, () => fetchQuestions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls', filter: `id=eq.${id}` }, (payload) => {
        if (payload.new) setPoll(payload.new as Poll);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function fetchData() {
    const [pollRes, optRes, voteRes, qRes] = await Promise.all([
      supabase.from('polls').select('*').eq('id', id).single(),
      supabase.from('options').select('*').eq('poll_id', id).order('display_order'),
      supabase.from('votes').select('*').eq('poll_id', id),
      supabase.from('questions').select('*').eq('poll_id', id).order('upvotes', { ascending: false })
    ]);

    if (pollRes.data) setPoll(pollRes.data);
    if (optRes.data) setOptions(optRes.data);
    if (voteRes.data) setVotes(voteRes.data);
    if (qRes.data) setQuestions(qRes.data);
  }

  async function fetchVotes() {
    const { data } = await supabase.from('votes').select('*').eq('poll_id', id);
    if (data) setVotes(data);
  }

  async function fetchQuestions() {
    const { data } = await supabase.from('questions').select('*').eq('poll_id', id).order('upvotes', { ascending: false });
    if (data) setQuestions(data);
  }

  if (!poll) return <div className="text-center py-24 text-slate-500 text-xl">Loading presentation...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-8 relative overflow-hidden">
      {/* Persistent QR Code Corner */}
      <div className="absolute top-6 right-6 bg-white p-3 rounded-2xl shadow-2xl flex flex-col items-center border border-slate-800">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(voteUrl)}`}
          alt="QR Code"
          className="w-28 h-28"
        />
        <span className="text-slate-900 text-xs font-bold mt-2 uppercase tracking-wide">Scan to Vote</span>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            poll.status === 'live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {poll.status}
          </span>
          <span className="text-slate-400 text-sm font-medium">{poll.title}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold max-w-4xl leading-tight mb-8">{poll.question}</h1>
      </div>

      <div className="my-auto py-8">
        {poll.type === 'choice' ? (
          <div className="max-w-5xl w-full">
            <MultipleChoiceResults options={options} votes={votes} isLarge={true} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
            {questions.slice(0, 6).map((q) => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                <p className="text-xl font-medium text-slate-100">{q.question_text}</p>
                <div className="flex items-center gap-2 bg-indigo-600/30 text-indigo-300 px-4 py-2 rounded-xl border border-indigo-500/30 text-lg font-bold">
                  <ThumbsUp className="w-5 h-5" /> {q.upvotes}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-slate-500 text-sm font-medium pt-6 border-t border-slate-900">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>PulseLive Presenter View</span>
        </div>
        <div>
          {poll.type === 'choice' ? `${votes.length} Total Votes` : `${questions.length} Total Questions`}
        </div>
      </div>
    </div>
  );
}

// --- Audience Vote Page ---
function AudienceVote() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [submittingQ, setSubmittingQ] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();

    // Check localStorage for prior vote
    if (localStorage.getItem(`voted_${id}`)) {
      setHasVoted(true);
    }
  }, [id]);

  async function fetchData() {
    const [pollRes, optRes, qRes] = await Promise.all([
      supabase.from('polls').select('*').eq('id', id).single(),
      supabase.from('options').select('*').eq('poll_id', id).order('display_order'),
      supabase.from('questions').select('*').eq('poll_id', id).order('upvotes', { ascending: false })
    ]);

    if (pollRes.data) setPoll(pollRes.data);
    if (optRes.data) setOptions(optRes.data);
    if (qRes.data) setQuestions(qRes.data);
  }

  async function handleVote(optionId: string) {
    if (hasVoted || poll?.status !== 'live') return;
    setSelectedOption(optionId);

    const { error } = await supabase.from('votes').insert([
      { poll_id: id, option_id: optionId }
    ]);

    if (!error) {
      setHasVoted(true);
      localStorage.setItem(`voted_${id}`, 'true');
    }
  }

  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestionText.trim() || poll?.status !== 'live') return;
    setSubmittingQ(true);

    const { data, error } = await supabase.from('questions').insert([
      { poll_id: id, question_text: newQuestionText.trim(), upvotes: 0 }
    ]).select().single();

    if (data) {
      setQuestions([data, ...questions]);
      setNewQuestionText('');
    }
    setSubmittingQ(false);
  }

  async function handleUpvote(qId: string, currentUpvotes: number) {
    const { error } = await supabase.from('questions').update({ upvotes: currentUpvotes + 1 }).eq('id', qId);
    if (!error) {
      setQuestions(questions.map(q => q.id === qId ? { ...q, upvotes: q.upvotes + 1 } : q));
    }
  }

  if (!poll) return <div className="text-center py-24 text-slate-500">Loading session...</div>;

  if (poll.status !== 'live') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <Square className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Session Not Active</h2>
          <p className="text-slate-400 text-sm">This poll or Q&A session is currently {poll.status}. Please wait for the presenter to open voting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col max-w-md mx-auto p-4 sm:p-6 justify-between">
      <div>
        <div className="mb-6 pt-4">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Live Session
          </span>
          <h1 className="text-2xl font-extrabold mt-3 mb-1">{poll.title}</h1>
          <p className="text-slate-300 text-base">{poll.question}</p>
        </div>

        {poll.type === 'choice' ? (
          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={hasVoted}
                className={`w-full text-left p-4 rounded-2xl border font-medium transition flex items-center justify-between ${
                  hasVoted
                    ? selectedOption === opt.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400 opacity-60'
                    : 'bg-slate-800 border-slate-700 hover:border-indigo-500 text-slate-100 hover:bg-slate-750'
                }`}
              >
                <span>{opt.option_text}</span>
                {selectedOption === opt.id && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
              </button>
            ))}
            {hasVoted && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center text-emerald-400 font-medium text-sm mt-6">
                ✓ Response recorded successfully!
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleAskQuestion} className="space-y-3">
              <textarea
                required
                rows={3}
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                placeholder="Ask a question or share feedback..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <button
                type="submit"
                disabled={submittingQ}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-2xl transition text-sm shadow-lg shadow-indigo-600/20"
              >
                Submit Question Here
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Submitted Questions</h3>
              {questions.map((q) => (
                <div key={q.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <p className="text-slate-200 text-sm font-medium">{q.question_text}</p>
                  <button
                    onClick={() => handleUpvote(q.id, q.upvotes)}
                    className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0"
                  >
                    <ThumbsUp className="w-4 h-4" /> {q.upvotes}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-6 text-xs text-slate-500">
        Powered by PulseLive Real-Time Engine
      </div>
    </div>
  );
}

// --- Main App Router ---
export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Routes>
        <Route path="/" element={<><Navbar /><Dashboard /></>} />
        <Route path="/create" element={<><Navbar /><CreatePoll /></>} />
        <Route path="/poll/:id" element={<><Navbar /><PollManagement /></>} />
        <Route path="/poll/:id/present" element={<PresenterView />} />
        <Route path="/vote/:id" element={<AudienceVote />} />
      </Routes>
    </div>
  );
}
