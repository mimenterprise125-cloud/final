import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AccountDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: any;
}

export const AccountDetailDialog = ({ open, onOpenChange, account }: AccountDetailDialogProps) => {
  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{account.provider} - {account.account_identifier}</DialogTitle>
          <DialogDescription>
            Account details and performance
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="text-lg font-semibold">{account.metadata?.account_type ?? '—'}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="text-lg font-semibold">{account.metadata?.platform ?? '—'}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-lg font-semibold text-primary">{typeof account.balance === 'number' ? account.balance.toLocaleString() : account.balance}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-lg font-semibold">{account.created_at ? new Date(account.created_at).toLocaleString() : '—'}</p>
            </Card>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">API Connection</p>
            <Badge variant="default">Connected</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};