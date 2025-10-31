import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { seedDatabase } from '../lib/seedData';
import { Database, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function DatabaseSeeder() {
  const [seeding, setSeeding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSuccess(false);
    setError(null);

    try {
      const result = await seedDatabase();
      if (result) {
        setSuccess(true);
      } else {
        setError('Seeding completed with some errors. Check console for details.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to seed database');
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <Database className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-center">Database Seeder</CardTitle>
          <CardDescription className="text-center">
            Populate your database with sample data for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Database seeded successfully! You can now login with the demo accounts.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-destructive/10 border-destructive/20">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="font-medium">This will create:</h3>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>3 user accounts (Admin, Moderator, Student)</li>
              <li>5 additional student accounts</li>
              <li>10 sample questions across different categories</li>
              <li>2 sample exams</li>
            </ul>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="font-medium">Test Credentials:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Admin:</strong> admin@exam.com / admin123</p>
              <p><strong>Moderator:</strong> moderator@exam.com / mod123</p>
              <p><strong>Student:</strong> student@exam.com / student123</p>
            </div>
          </div>

          <Button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full"
          >
            {seeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {seeding ? 'Seeding Database...' : 'Seed Database'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Note: If accounts already exist, they will be skipped.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
