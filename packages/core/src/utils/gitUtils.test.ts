/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { getSafeGitEnv } from './gitUtils.js';

describe('getSafeGitEnv', () => {
  it('strips execution-affecting GIT_* variables from the environment', () => {
    const env = getSafeGitEnv({
      PATH: '/usr/bin',
      HOME: '/home/user',
      GIT_EXEC_PATH: '/evil/bin',
      GIT_PROXY_COMMAND: 'evil-proxy',
      GIT_SSH_COMMAND: 'evil-ssh',
      GIT_SSH_VARIANT: 'ssh',
      GIT_TEMPLATE_DIR: '/evil/templates',
      GIT_ALTERNATE_OBJECT_DIRECTORIES: '/evil/objects',
    });

    expect(env['GIT_EXEC_PATH']).toBeUndefined();
    expect(env['GIT_PROXY_COMMAND']).toBeUndefined();
    expect(env['GIT_SSH_COMMAND']).toBeUndefined();
    expect(env['GIT_SSH_VARIANT']).toBeUndefined();
    expect(env['GIT_TEMPLATE_DIR']).toBeUndefined();
    expect(env['GIT_ALTERNATE_OBJECT_DIRECTORIES']).toBeUndefined();

    // Unrelated variables must survive.
    expect(env['PATH']).toBe('/usr/bin');
    expect(env['HOME']).toBe('/home/user');
  });

  it('strips inherited GIT_CONFIG_* overrides and parameters', () => {
    const env = getSafeGitEnv({
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'core.hooksPath',
      GIT_CONFIG_VALUE_0: '/evil/hooks',
      GIT_CONFIG_PARAMETERS: "'core.hooksPath=/evil/hooks'",
    });

    expect(env['GIT_CONFIG_COUNT']).not.toBe('1');
    expect(env['GIT_CONFIG_KEY_0']).toBe('credential.helper');
    expect(env['GIT_CONFIG_VALUE_0']).toBe('');
    expect(env['GIT_CONFIG_PARAMETERS']).toBeUndefined();
  });

  it('pins safe git config overrides', () => {
    const env = getSafeGitEnv({});

    expect(env['GIT_CONFIG_GLOBAL']).toBeDefined();
    expect(env['GIT_CONFIG_SYSTEM']).toBeDefined();
    expect(env['GIT_CONFIG_NOSYSTEM']).toBe('1');
    expect(env['GIT_CONFIG_KEY_2']).toBe('core.hooksPath');
    expect(env['GIT_CONFIG_VALUE_2']).toBe('');
    expect(env['GIT_CONFIG_KEY_3']).toBe('core.sshCommand');
    expect(env['GIT_CONFIG_VALUE_3']).toBe('');
  });
});
