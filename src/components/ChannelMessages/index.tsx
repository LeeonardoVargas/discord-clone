import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import ReactLoading from 'react-loading';

import { useTheme } from 'styled-components';
import {
  Container,
  Messages,
  Message,
  ContentMessage,
  HeaderMessage,
  LoadingMessages,
} from './styles';
import MeAvatar from '../../assets/avatars/eu.jpeg';
import NewMessage from './NewMessage';
import api from '../../services/api';

interface IMessage {
  id: number;
  content: string;
  date: string;
  username: string;
  avatar_url: string;
  hasMention?: boolean;
}

interface IUserProps {
  name: string;
  avatar_url: string;
}

const ChannelMessages: React.FC = () => {
  const { colors } = useTheme();
  const messagesRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  // Carregando usuário
  const user = useMemo<IUserProps>(() => {
    const userLogin = localStorage.getItem('@DiscordLeoVargas:user');
    if (userLogin) return { ...JSON.parse(userLogin) };

    return {} as IUserProps;
  }, []);
  // Carrega as messegens do final
  useEffect(() => {
    const div = messagesRef.current;
    if (div) div.scrollTop = div.scrollHeight;
  }, [messagesRef, messages]);

  useEffect(() => {
    api.get('/messages').then(response => {
      setMessages(response.data);
      setLoading(false);
    });
  }, []);

  const handleNewMessage = useCallback(
    async (message: string): Promise<void> => {
      try {
        const response = await api.post('/new-message', {
          content: message,
          username: user.name,
          avatar_url: user.avatar_url,
        });
        setMessages([...messages, response.data]);
      } catch (err) {
        console.log(err);
      }
    },
    [user, messages],
  );

  return (
    <Container>
      {loading ? (
        <LoadingMessages>
          <ReactLoading
            type="spinningBubbles"
            color={colors.discord}
            height={100}
            width={100}
          />
          <h3>Carregando as mensagens</h3>
        </LoadingMessages>
      ) : (
        <Messages ref={messagesRef}>
          <Message hasMention>
            <img alt="Mestre Leo Vargas" src={MeAvatar} />
            <ContentMessage>
              <HeaderMessage>
                <strong>Leo</strong>
                <span>Inicio dos tempo</span>
              </HeaderMessage>
              <p>
                Menção: Pessoas de sexo <span>@masculino</span> no inglês mens
                são!
              </p>
            </ContentMessage>
          </Message>

          {messages.map(message => (
            <Message key={message.id} hasMention={!!message.hasMention}>
              <img alt={message.username} src={message.avatar_url} />
              <ContentMessage>
                <HeaderMessage>
                  <strong>{message.username}</strong>
                  <span>{message.date}</span>
                </HeaderMessage>
                <p>{message.content}</p>
              </ContentMessage>
            </Message>
          ))}
        </Messages>
      )}
      <NewMessage handleNewMessage={handleNewMessage} />
    </Container>
  );
};

export default ChannelMessages;
