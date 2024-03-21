import { Image } from '@nextui-org/react';
import { useTheme } from 'next-themes';

export default function Index() {
  const { theme } = useTheme();

  return (
    <div 
      style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', 
        backgroundColor: theme === 'dark' ? '#000' : '#fff' 
      }}
    >
      <Image src="/solvlogo.png" alt="Logo" width={500} height={300} />
    </div>
  );
}