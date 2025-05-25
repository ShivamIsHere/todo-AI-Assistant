import express from 'express';
import {
  getTodos,
  addTodo,
  deleteTodo,
  updateTodo,
  summarizeTodos,
  sendToSlack,
} from '../controllers/todoController.js';

const router = express.Router();

router.get('/', getTodos);
router.post('/', addTodo);
router.delete('/:id', deleteTodo);
router.put('/:id', updateTodo);
router.post('/summarize', summarizeTodos);
router.post('/slack', sendToSlack);

export default router;
