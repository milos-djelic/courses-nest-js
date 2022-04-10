import { Injectable, NotFoundException } from '@nestjs/common';
import {readFile, writeFile } from 'fs/promises';

@Injectable()
export class MessagesRepository {
  async findAll() {
    return JSON.parse(await readFile('messages.json', 'utf-8'));
  }

  async findOne(id: string) {
    const message = JSON.parse(await readFile('messages.json', 'utf-8'))[id];
    if (!message) {
      throw new NotFoundException;
    }
    return message;
  }

  async create(content: string) {
    const id = Math.floor(Math.random() * 999);
    const messages = JSON.parse(await readFile('messages.json', 'utf-8'));
    console.log(messages);
    messages[id] = {content, id};
    console.log(messages);

    await writeFile('messages.json', JSON.stringify(messages));
  }
}