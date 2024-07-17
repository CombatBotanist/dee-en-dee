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
  Input,
  Link,
  Menu,
  MenuItem,
  SelectField,
  View,
} from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  InlineEditor,
  AccessibilityHelp,
  Autoformat,
  Autosave,
  Bold,
  Essentials,
  Italic,
  List,
  Mention,
  Paragraph,
  Strikethrough,
  TextTransformation,
  Underline,
  Undo,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import './App.css';

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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

  async function getAutocompleteItems(query: string) {
    const { data } = await client.models.Person.list();
    console.debug('Autocomplete items:', data);
    return data
      .filter(({ name }) => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10)
      .map((entry) => {
        return {
          id: `@${entry.name}`,
          text: entry.name,
        };
      });
  }

  const editorConfig = {
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'accessibilityHelp',
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      AccessibilityHelp,
      Autoformat,
      Autosave,
      Bold,
      Essentials,
      Italic,
      List,
      Mention,
      Paragraph,
      Strikethrough,
      TextTransformation,
      Underline,
      Undo,
    ],
    mention: {
      feeds: [
        {
          marker: '@',
          feed: getAutocompleteItems,
          minimumCharacters: 1,
        },
      ],
    },
    placeholder: 'Type or paste your content here!',
  };

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
                <Input
                  placeholder='Enter name here...'
                  onChange={({ target }) => setName(target.value)}
                />
                <CKEditor
                  editor={InlineEditor}
                  config={editorConfig}
                  onChange={(_event, editor) => {
                    setDescription(editor.getData());
                  }}
                />
                <Button
                  onClick={async () => {
                    console.debug({
                      name,
                      description,
                    });
                    const result = await client.models.Person.create({
                      name,
                      description,
                    });
                    console.debug('Person created:', result);
                  }}
                >
                  Create
                </Button>
                {/* <Button onClick={getAutocompleteItems}>
                  Get autocomplete items
                </Button> */}
              </View>
            </Flex>
          </Card>
        </Grid>
      )}
    </Authenticator>
  );
}
