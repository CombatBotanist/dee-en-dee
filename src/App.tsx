import { useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { Authenticator, Button, Card, Collection, Divider, Flex, Heading, Link, View } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt('Todo content') });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <Authenticator signUpAttributes={['preferred_username']}>
      {({ signOut, user }) => (
        <Flex direction='column'>
          <Heading level={3}>Todos</Heading>
          <Button variation='primary' onClick={createTodo}>
            + new
          </Button>
          <Collection type='list' items={todos}>
            {(todo) => (
              <Card key={todo.id} onClick={() => deleteTodo(todo.id)}>
                {todo.content}
              </Card>
            )}
          </Collection>
          <View>
            🥳 App successfully hosted. Try creating a new todo.
            <Divider />
            <Link href='https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates'>
              Review next step of this tutorial.
            </Link>
          </View>
          <Button variation='primary' onClick={signOut}>
            Sign out
          </Button>
        </Flex>
      )}
    </Authenticator>
  );
}

export default App;
