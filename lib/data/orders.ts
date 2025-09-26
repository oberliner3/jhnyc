import type { Order } from '@/lib/types';

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    date: '2023-10-26T10:00:00Z',
    status: 'Delivered',
    total: 99.99,
    items: [
      {
        id: '1',
        name: 'Classic T-Shirt',
        price: 29.99,
        quantity: 1,
        image: 'https://via.placeholder.com/150',
      },
      {
        id: '2',
        name: 'Jeans',
        price: 70.00,
        quantity: 1,
        image: 'https://via.placeholder.com/150',
      },
    ],
  },
  {
    id: '2',
    date: '2023-10-20T14:30:00Z',
    status: 'Shipped',
    total: 45.50,
    items: [
      {
        id: '3',
        name: 'Beanie',
        price: 45.50,
        quantity: 1,
        image: 'https://via.placeholder.com/150',
      },
    ],
  },
];
