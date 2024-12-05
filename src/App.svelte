<script lang="ts">
  import { parseTezosUri } from './lib/parser';
  
  let inputValue = '';
  let contract = '';
  let network = '';
  let parsedResult: any = null;

  function processInput(defaultContract: string, defaultNetwork: string) {
    const result = parseTezosUri(inputValue, defaultContract, defaultNetwork);
    if (result.error) {
      console.error('Failed to parse URI:', result.error);
    }
    parsedResult = result;
  }
</script>

<main>
  <h1>Tezos URI parser</h1>
  <p>Enter a Tezos URI below</p>
  <p>Note that default contract and networks are overridden if specified in the URI</p>
  <br/>
  <br/>
  <p>Examples:</p>
  <code>tezos-storage://KT1GbXzhzCbxiQHTHau8oTVjcGgRK1RJei5u.ghostnet/name</code>
  <br/>
  <br/>
  <select bind:value={network}>
    <option value="">No default network</option>
    <option value="mainnet">Mainnet</option>
    <option value="ghostnet">Ghostnet</option>
  </select>
  <br/>
  <input type="text" bind:value={contract} placeholder="Enter contract address here..." />
  <br/>
  <div class="input-container">
    <input 
      type="text"
      bind:value={inputValue}
      placeholder="Enter text here..."
    />
    <br/>
    <button on:click={() => processInput(contract, network)}>
      Process
    </button>
  </div>
  <br/>
  <br/>
  <p>Result:</p>
  {#if parsedResult}
    {#if parsedResult.error}
      <div class="error">
        <span>{parsedResult.error}</span>
      </div>
    {:else}
      {#each parsedResult.tokens as token}
        <div>
          <span>{token.tokenType}</span>
          <br/>
          <span>{token.value}</span>
        </div>
        <br/>
      {/each}
    {/if}
  {/if}
</main>