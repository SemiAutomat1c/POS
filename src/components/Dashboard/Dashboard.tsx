import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ShoppingCart as SalesIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickAction = ({ icon, title, onClick }: any) => (
  <Button
    variant="contained"
    startIcon={icon}
    onClick={onClick}
    sx={{
      width: '100%',
      height: '100px',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      '& .MuiButton-startIcon': {
        margin: 0,
        transform: 'scale(1.5)',
      },
    }}
  >
    {title}
  </Button>
);

// Mock data - will be replaced with real data later
const recentSales = [
  {
    product: 'iPhone 13 Pro',
    identifier: 'IMEI: 352789102345678',
    amount: '₱65,990',
    time: 'Today, 10:23 AM',
  },
  {
    product: 'Samsung Galaxy Buds',
    identifier: 'SN: BUD78901234',
    amount: '₱7,990',
    time: 'Today, 9:45 AM',
  },
  {
    product: 'JBL Flip 5',
    identifier: 'SN: JBL5678901',
    amount: '₱5,490',
    time: 'Yesterday, 4:30 PM',
  },
];

const upcomingPayments = [
  {
    customer: 'Maria Santos',
    item: 'iPhone 12 - 2nd payment',
    amount: '₱10,000',
    dueDate: 'Due in 2 days',
    urgent: true,
  },
  {
    customer: 'Juan Dela Cruz',
    item: 'MacBook Air - 3rd payment',
    amount: '₱15,000',
    dueDate: 'Due in 5 days',
    warning: true,
  },
  {
    customer: 'Ana Reyes',
    item: 'Samsung TV - Final payment',
    amount: '₱8,500',
    dueDate: 'Due in 10 days',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: <SalesIcon />,
      title: 'New Sale',
      onClick: () => navigate('/sales'),
    },
    {
      icon: <AddIcon />,
      title: 'Add Product',
      onClick: () => navigate('/inventory'),
    },
    {
      icon: <SearchIcon />,
      title: 'Search Inventory',
      onClick: () => navigate('/inventory'),
    },
    {
      icon: <ReceiptIcon />,
      title: 'View Reports',
      onClick: () => navigate('/reports'),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} md={3} key={index}>
              <QuickAction {...action} />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Sales
              </Typography>
              <Typography variant="h4">₱79,470</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mt: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, fontSize: '1rem' }} />
                <Typography variant="body2">+12% from yesterday</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Items in Stock
              </Typography>
              <Typography variant="h4">156</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Across all categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h4" color="error">3</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main', mt: 1 }}>
                <WarningIcon sx={{ mr: 1, fontSize: '1rem' }} />
                <Typography variant="body2">Needs attention</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Payments
              </Typography>
              <Typography variant="h4">7</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main', mt: 1 }}>
                <TrendingDownIcon sx={{ mr: 1, fontSize: '1rem' }} />
                <Typography variant="body2">2 due this week</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Sales
            </Typography>
            <List>
              {recentSales.map((sale, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={sale.product}
                      secondary={sale.identifier}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body1">{sale.amount}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {sale.time}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < recentSales.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Payments
            </Typography>
            <List>
              {upcomingPayments.map((payment, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={payment.customer}
                      secondary={payment.item}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body1">{payment.amount}</Typography>
                      <Typography 
                        variant="body2" 
                        color={payment.urgent ? 'error' : payment.warning ? 'warning.main' : 'textSecondary'}
                      >
                        {payment.dueDate}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < upcomingPayments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 