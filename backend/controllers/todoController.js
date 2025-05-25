import { getSupabase } from '../services/supabaseClient.js';
import { generateSummary } from '../services/googleAI.js';
import axios from 'axios';

const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

export const getTodos = async (req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const addTodo = async (req, res) => {
  const supabase = getSupabase();
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const { data, error } = await supabase.from('todos').insert([{ title }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
};

export const deleteTodo = async (req, res) => {
  const supabase = getSupabase();
  const { id } = req.params;
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};

export const updateTodo = async (req, res) => {
  const supabase = getSupabase();
  const { id } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const { data, error } = await supabase
    .from('todos')
    .update({ title })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
};

export const summarizeTodos = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data: todos, error } = await supabase.from('todos').select('*');
    if (error) return res.status(500).json({ error: error.message });
    if (!todos.length) return res.status(400).json({ error: 'No todos to summarize' });

    const prompt = todos.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    const summary = await generateSummary(`Summarize these todos:\n${prompt}`);

    console.log("✅ Summary generated:", summary); // <-- helpful for debugging

    res.json({ summary });
  } catch (err) {
    console.error("❌ Error summarizing todos:", err);
    res.status(500).json({ error: 'Failed to summarize todos' });
  }
};


export const sendToSlack = async (req, res, next) => {
  try {
    const { summary } = req.body;
    if (!summary) return res.status(400).json({ error: 'Summary is required' });

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!slackWebhookUrl) {
      console.error("❌ SLACK_WEBHOOK_URL is not defined");
      return res.status(500).json({ error: 'Missing Slack webhook URL' });
    }

    console.log("📤 Sending to Slack:", summary);

    const slackRes = await axios.post(slackWebhookUrl, { text: summary });

    console.log("✅ Slack response:", slackRes.status); // Should be 200

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to send to Slack:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to send to Slack' });
  }
};

