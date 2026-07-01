const { execSync } = require('child_process');

function findPasswordInGit() {
  try {
    console.log('Searching git history for postgres/supabase passwords...');
    // Search git log for any passwords, connection strings, etc.
    const output = execSync('git log -p -S"postgresql" -S"postgres:" -S"password" --oneline', { encoding: 'utf-8' });
    console.log('Git history matches:');
    console.log(output || 'No matches found.');
  } catch (err) {
    console.error('Error searching git history:', err.message);
  }
}

findPasswordInGit();
