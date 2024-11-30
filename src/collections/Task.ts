import type { CollectionConfig } from 'payload'

const Task: CollectionConfig = {
  slug: 'task',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'To Do', value: 'TODO' },
        { label: 'In Progress', value: 'IN PROGRESS' },
        { label: 'Done', value: 'DONE' },
      ],
      required: true,
    },
    {
      name: 'user_email',
      type: 'text',
      required: true,
    },
  ],
};

export default Task;
