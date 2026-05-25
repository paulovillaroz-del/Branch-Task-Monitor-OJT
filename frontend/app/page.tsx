import { redirect } from 'next/navigation';

export default function HomePage() {
  // Itatapon nito ang user papunta sa bago, malinis, at role-based na dashboard natin
  redirect('/dashboard');
}