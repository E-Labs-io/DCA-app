<!-- @format -->

# Admin Dashboard

The Admin Dashboard provides comprehensive control over the DCA (Dollar Cost Averaging) system's core contracts: DCAFactory and DCAExecutor.

## Access Control

The dashboard is protected by smart contract-based access control. Only addresses that have been granted admin privileges on the DCAExecutor contract can access the dashboard.

### Accessing the Dashboard

1. Connect your wallet to the application
2. Navigate to `/dashboard` (or click "Admin Dashboard" button if you're an admin)
3. The system will automatically verify your admin status
4. If you're not an admin, you'll see an access denied message

## Features

### System Overview

- **Real-time Metrics**: View active strategies, total executions, deployed accounts
- **System Health**: Monitor the status of both Factory and Executor contracts
- **Contract Information**: Display all relevant contract addresses

### DCA Executor Controls

#### System Management

- **Pause/Unpause**: Control whether the executor can process DCA strategies
- **Interval Management**: Enable/disable specific trading intervals (1min, 5min, 1hour, etc.)
- **Token Allowances**: Control which tokens can be used as base tokens for DCA strategies

#### Advanced Controls

- **Change Executor Address**: Update the executor address for contract operations
- **Fee Management**: Configure fee distribution across stakeholders

### DCA Factory Controls

#### Factory Management

- **Pause/Unpause**: Control whether users can create new DCA accounts
- **Executor Address**: Update the executor address used by the factory
- **Reinvest Library**: Update the reinvest logic library address

#### Emergency Controls

- **Emergency Pause**: Immediately stop all factory operations in case of security issues

### Admin Management

#### Admin Operations

- **Add Admin**: Grant admin privileges to new addresses
- **Remove Admin**: Revoke admin privileges from existing admins
- **Check Admin Status**: Verify if an address has admin privileges

#### Security Guidelines

- Always verify addresses before granting admin access
- Consider using multi-signature wallets for admin accounts
- Don't remove your own admin access unless other admins exist
- Keep admin count minimal but ensure redundancy

## Contract Functions Available

### DCAExecutor Functions

- `setActiveState(bool)` - Pause/unpause the executor
- `setIntervalActive(interval, status)` - Enable/disable specific intervals
- `setBaseTokenAllowance(token, allowed)` - Allow/disallow base tokens
- `addAdmin(address)` - Add new admin
- `removeAdmin(address)` - Remove existing admin
- `changeExecutor(address)` - Change executor address
- `checkIfAdmin(address)` - Check admin status

### DCAFactory Functions

- `pauseFactory()` - Pause the factory
- `unpauseFactory()` - Unpause the factory
- `updateExecutorAddress(address)` - Update executor address
- `updateReinvestLibraryAddress(address)` - Update reinvest library

## Safety Considerations

1. **Test on Testnet First**: Always test admin operations on testnet before mainnet
2. **Verify Addresses**: Double-check all addresses before updating contract references
3. **Monitor System Health**: Regularly check system metrics and status
4. **Emergency Procedures**: Have a plan for emergency pausing if issues arise
5. **Admin Redundancy**: Ensure multiple trusted admins exist

## Migration Considerations

This dashboard is designed to be easily extracted into its own project (`dashboard.ation.capital`). All admin components are:

- Self-contained in `components/ui/admin/`
- Use dedicated hooks (`useExecutorAdmin`, `useFactoryAdmin`)
- Independent routing at `/dashboard`
- Minimal dependencies on the main app

To migrate to a separate project:

1. Copy `components/ui/admin/` directory
2. Copy `hooks/useExecutorAdmin.ts` and `hooks/useFactoryAdmin.ts`
3. Copy `app/dashboard/` directory
4. Ensure contract addresses and types are properly configured
5. Set up independent deployment pipeline

## Development

### Adding New Admin Functions

1. Add the function to the appropriate hook (`useExecutorAdmin` or `useFactoryAdmin`)
2. Create UI controls in the corresponding component
3. Add proper error handling and user feedback
4. Test thoroughly on testnet

### Extending Metrics

1. Add new metric fetching to the hooks' getter functions
2. Update the `SystemMetrics` component to display new data
3. Consider adding refresh intervals for real-time data

## Security Notes

- Admin dashboard should be accessed over HTTPS in production
- Consider implementing additional authentication layers for sensitive operations
- Monitor admin activities and maintain audit logs
- Regular security audits of admin functions are recommended
