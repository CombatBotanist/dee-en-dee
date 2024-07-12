import { useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import {
  Authenticator,
  Button,
  Card,
  Collection,
  Divider,
  Flex,
  Grid,
  Heading,
  Link,
  Menu,
  MenuItem,
  SelectField,
  View,
} from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    console.debug('Subscribed to todos in useEffect');
  }, []);

  Hub.listen('auth', ({ payload: { event } }) => {
    switch (event) {
      case 'signedOut':
        window.location.reload();
        break;
      case 'signedIn':
        client.models.Todo.observeQuery().subscribe({
          next: (data) => setTodos([...data.items]),
        });
        console.debug('Subscribed to todos in Hub.listen');
        break;
      default:
        break;
    }
  });

  function createTodo() {
    client.models.Todo.create({ content: window.prompt('Todo content') });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <Authenticator signUpAttributes={['preferred_username']}>
      {({ signOut, user }) => (
        <Grid>
          <Card backgroundColor='rgb(76, 0, 0)'>
            <Flex
              direction='row'
              columnStart='1'
              columnEnd='-1'
              justifyContent='space-between'
              alignItems='center'
            >
              <Heading
                level={2}
                color='white'
              >
                Campaign Index
              </Heading>
              <Flex direction='row'>
                <SelectField
                  label='Campaign'
                  labelHidden={true}
                  size='small'
                >
                  <option>Spelljammer</option>
                  <option>Spellsmoke</option>
                </SelectField>
                <Menu menuAlign='end'>
                  <MenuItem>{user?.signInDetails?.loginId}</MenuItem>
                  <MenuItem onClick={signOut}>Logout</MenuItem>
                </Menu>
              </Flex>
            </Flex>
          </Card>
          <Card>
            <Flex direction='column'>
              <Heading level={3}>Todos</Heading>
              <Button
                variation='primary'
                onClick={createTodo}
              >
                + new
              </Button>
              <Collection
                type='list'
                items={todos}
              >
                {(todo) => (
                  <Card
                    key={todo.id}
                    onClick={() => deleteTodo(todo.id)}
                    borderColor='black'
                    borderRadius='small'
                    borderWidth='thin'
                  >
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
            </Flex>
          </Card>
        </Grid>
      )}
    </Authenticator>
  );
}
