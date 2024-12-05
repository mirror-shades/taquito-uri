<script lang="ts">
  import { parseTezosUri } from './lib/parser';
  import { executeTokens } from './lib/exec';
  
  let inputValue = '';
  let contract = '';
  let network = '';
  let parsedResult: any = null;
  let execResult: any = null;

  async function processInput(defaultContract: string, defaultNetwork: string) {
    const result = parseTezosUri(inputValue, defaultContract, defaultNetwork);
    if (result.error) {
      console.error('Failed to parse URI:', result.error);
    }
    parsedResult = result;
    execResult = await executeTokens(result.tokens);
    console.log('Execution Result:', execResult);
  }
</script>

<main>
  <h1>Tezos URI parser</h1>
  <p>Enter a Tezos URI below</p>
  <p>Note that default contract and networks are overridden if specified in the URI</p>
  <br/>
  <br/>
  <p>Examples:</p>
  <code>tezos-storage://KT1N7ZcRUDd7eEiL4a1bggvsxfxR7Z9h6PUt.ghostnet/name</code>
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
  {#if execResult}
    <p>Execution Result:</p>
    {#if execResult.error}
      <div class="error">
        <span>{execResult.error}</span>
      </div>
    {:else}
      <div>
        <span>Protocol: {execResult.protocol}</span><br/>
        <span>Contract: {execResult.contract}</span><br/>
        <span>Network: {execResult.network}</span><br/>
        <span>Path: {execResult.path}</span><br/>
        <span>RPC URL: {execResult.rpcUrl}</span><br/>
        <span>Result: {execResult.result}</span>
      </div>
    {/if}
  {/if}
</main>