'use client';
import fetchSuggestion from '@/lib/fetchSuggestion';
import { useBoardStore } from '@/store/BoardStore';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Avatar from 'react-avatar';

function Header() {
  const [board, searchString, setSearchString] = useBoardStore((state) => [
    state.board,
    state.searchString,
    state.setSearchString,
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<any[]>([]);

  useEffect(() => {
    if (board.columns.size === 0) return;
    setLoading(true);

    const fetchSuggestionFunction = async () => {
      const suggestion = await fetchSuggestion(board);
      setSuggestion(suggestion);
      setLoading(false);
    };

    setTimeout(() => {
      fetchSuggestionFunction();
    }, 3000);
  }, [board]);

  return (
    <header>
      <div className='flex flex-col md:flex-row items-center p-5 bg-gray-500/10 rounded-b-2xl'>
        <div className='absolute top-0 left-0 w-full h-96 bg-gradient-to-tr from-pink-400 to-[#000080] rounded-md filter blur-3xl opacity-50 -z-50' />

        <Image
          src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcqwIdEM6MMVRaDUUUwqOxnSQitRdUbCbO2gQpD86HTdagJtrUdwbtOA5UzkObdT7WjA&usqp=CAU'
          alt='Trello logo'
          width={300}
          height={300}
          className='w-44 md:w-56 pb-10 md:pb-0 object-contain'
        />

        <div className='flex items-center space-x-5 flex-1 justify-end w-full'>
          <form className='flex items-center space-x-5 bg-sky-100 rounded-md p-2 shadow-md flex-1 md:flex-initial'>
            <MagnifyingGlassIcon className='h-7 w-7 text-black' />
            <input
              className='flex-1 outline-none p-2 text-blue-900'
              type='text'
              placeholder='Search'
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
            <button type='submit' hidden>
              Search
            </button>
          </form>
          <Avatar
            src='https://avatars.githubusercontent.com/u/10135865?v=4'
            className='ml-2'
            round
            size='55'
            color='#0055D1'
          />
        </div>
      </div>

      <div className='flex justify-center px-5 py-2 md:py-5'>
        <p className='bg-white rounded-md shadow-md p-2 text-[#0055D1]'>
          <UserCircleIcon
            className={`inline-block h-10 w-10 text-[#0055D1] mr-1 ${
              loading && 'animate-spin'
            }`}
          />
          {suggestion.length !== 0
            ? `Board status: ${
                suggestion[0] === 1
                  ? '1 ToDo task'
                  : `${suggestion[0]} ToDo tasks`
              }, ${
                suggestion[1] === 1
                  ? '1 In Progress task'
                  : `${suggestion[1]} In Progress tasks`
              } and ${
                suggestion[2] === 1
                  ? '1 Done task'
                  : `${suggestion[2]} Done tasks`
              }`
            : 'We are summarising your tasks for the day'}
        </p>
      </div>
    </header>
  );
}

export default Header;
