#!/bin/bash

ssh uberspace rm -rf www/chores.t-animal.de/*
scp -r build/* uberspace:www/chores.t-animal.de
ssh uberspace chmod a+rX -R www/chores.t-animal.de/*
