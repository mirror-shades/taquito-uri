# sample metadata at ipfs://bafkreiaiurcm744gcv4ru65y5h3y7ycspyrquowhl2l34chnhyc2v24v24
# contract at KT1N7ZcRUDd7eEiL4a1bggvsxfxR7Z9h6PUt
# use in smartpy.io for best results

import smartpy as sp

@sp.module
def main():
    class MyContract(sp.Contract):
        def __init__(self):
            self.data.metadata = sp.big_map({
                "": sp.pack("ipfs://bafkreiaiurcm744gcv4ru65y5h3y7ycspyrquowhl2l34chnhyc2v24v24"),
                "name": sp.pack("Name goes here")
            })

@sp.add_test()
def test():
    scenario = sp.test_scenario("MyContract test", main)
    scenario.h1("MyContract")

    contract = main.MyContract()
    scenario += contract
    